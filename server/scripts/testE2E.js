// Rode com o servidor rodando: node server.js
// Em outro terminal: node scripts/testE2E.js

const BASE_URL = 'http://localhost:3000/api';

const log = {
  ok: (m) => console.log(`✅ ${m}`),
  fail: (m) => { console.log(`❌ ${m}`); process.exitCode = 1; },
  info: (m) => console.log(`ℹ️  ${m}`),
  title: (m) => console.log(`\n🔹 ${m}`),
};

// Função auxiliar para fazer requisições
async function req(metodo, rota, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method: metodo, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${rota}`, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  try {
    log.title('1. Health Check');
    const health = await req('GET', '/health');
    if (health.status === 200) log.ok('Servidor online');
    else log.fail(`Servidor fora do ar ou rota /health não existe (status ${health.status})`);

    const emailUser = `user${Date.now()}@teste.com`;
    const emailAdmin = `admin${Date.now()}@teste.com`;
    let tokenUser = '';
    let tokenAdmin = '';
    let salaId = '';
    let agendamentoId = '';

    // ==========================================
    log.title('2. Cadastro de Usuário Comum');
    const regUser = await req('POST', '/auth/register', {
      nome: 'Usuario E2E', email: emailUser, senha: 'senha123'
    });
    if (regUser.status === 201 && regUser.data.token) {
      log.ok('Usuário registrado e token recebido');
      tokenUser = regUser.data.token;
      if (regUser.data.usuario.role === 'user') log.ok('Role do novo usuário é "user"');
      else log.fail('Role do novo usuário está errada');
    } else log.fail(`Erro ao registrar usuário: ${JSON.stringify(regUser.data)}`);

    // ==========================================
    log.title('3. Criar Admin (via banco)');
    // Como não há rota pública para criar admin, o script avisa
    log.info('O Admin precisa ser criado via script no banco (seed).');
    log.info('Vou tentar logar com admin@teste.com / admin123');
    const logAdmin = await req('POST', '/auth/login', {
      email: 'admin@teste.com', senha: 'admin123'
    });
    if (logAdmin.status === 200 && logAdmin.data.token) {
      log.ok('Login Admin funcionou');
      tokenAdmin = logAdmin.data.token;
    } else {
      log.fail('Admin não existe. Rode o script de seed antes de testar.');
      return;
    }

    // ==========================================
    log.title('4. Segurança - Rota Protegida Sem Token');
    const semToken = await req('GET', '/salas');
    if (semToken.status === 401) log.ok('Bloqueou acesso sem token (401)');
    else log.fail(`Esperava 401, recebeu ${semToken.status}`);

    // ==========================================
    log.title('5. Criar Sala (Admin)');
    const criarSala = await req('POST', '/salas', {
      nome: `Sala Teste E2E ${Date.now()}`,
      capacidade: 6,
      descricao: 'Sala para testes'
    }, tokenAdmin);

    if (criarSala.status === 201 && criarSala.data._id) {
      log.ok('Admin criou a sala');
      salaId = criarSala.data._id;
    } else log.fail(`Erro ao criar sala: ${JSON.stringify(criarSala.data)}`);

    // ==========================================
    log.title('6. Segurança - User Comum Tentando Criar Sala');
    const userCriandoSala = await req('POST', '/salas', {
      nome: 'Sala Invasão', capacidade: 2
    }, tokenUser);

    if (userCriandoSala.status === 403) log.ok('Bloqueou user comum (403)');
    else log.fail(`Esperava 403, recebeu ${userCriandoSala.status}`);

    // ==========================================
    log.title('7. Validação Joi (Capacidade Inválida)');
    const salaInvalida = await req('POST', '/salas', {
      nome: 'Sala Errada', capacidade: -5
    }, tokenAdmin);

    if (salaInvalida.status === 400) log.ok('Joi barrou capacidade negativa (400)');
    else log.fail(`Esperava 400, recebeu ${salaInvalida.status}`);

    // ==========================================
    log.title('8. Criar Agendamento (User)');
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataStr = amanha.toISOString().split('T')[0];

    const criarAg = await req('POST', '/agendamentos', {
      sala: salaId,
      data: dataStr,
      hora: '15:00'
    }, tokenUser);

    if (criarAg.status === 201 || criarAg.status === 200) {
      log.ok(`Agendamento criado para ${dataStr} às 15:00`);
      agendamentoId = criarAg.data._id || criarAg.data.agendamento?._id;
    } else {
      log.fail(`Erro ao agendar: ${JSON.stringify(criarAg.data)}`);
    }

    // ==========================================
    log.title('9. Regra de Negócio - Conflito de Horário');
    // O mesmo user (ou outro) tenta o mesmo horário na mesma sala
    const conflito = await req('POST', '/agendamentos', {
      sala: salaId,
      data: dataStr,
      hora: '15:00'
    }, tokenAdmin); // usando admin só para não dar erro de permissão

    if (conflito.status === 409 || conflito.status === 400) {
      log.ok('Bloqueou horário duplicado (409/400)');
    } else {
      log.fail(`Permitiu horário duplicado! Status: ${conflito.status} - ${JSON.stringify(conflito.data)}`);
    }

    // ==========================================
    log.title('10. Admin Vê Todos os Agendamentos');
    const listarAdmin = await req('GET', '/agendamentos', null, tokenAdmin);
    if (listarAdmin.status === 200 && Array.isArray(listarAdmin.data)) {
      log.ok(`Admin listou ${listarAdmin.data.length} agendamentos`);
    } else if (listarAdmin.status === 200 && Array.isArray(listarAdmin.data.agendamentos)) {
      log.ok(`Admin listou ${listarAdmin.data.agendamentos.length} agendamentos`);
    } else {
      log.fail(`Erro ao listar: ${listarAdmin.status}`);
    }

    // ==========================================
    log.title('11. Admin Aprova Agendamento');
    if (agendamentoId) {
      // Tenta PATCH /:id/status ou /:id/aprovar (depende de como a dupla fez)
      const aprovar = await req('PATCH', `/agendamentos/${agendamentoId}/aprovar`, null, tokenAdmin);
      if (aprovar.status === 200) log.ok('Agendamento aprovado');
      else {
        // Tenta a rota alternativa
        const aprovar2 = await req('PATCH', `/agendamentos/${agendamentoId}/status`, { status: 'aprovado' }, tokenAdmin);
        if (aprovar2.status === 200) log.ok('Agendamento aprovado (via status)');
        else log.fail(`Erro ao aprovar. Status: ${aprovar.status}`);
      }
    }

    // ==========================================
        // ==========================================
    log.title('12. User Comum Tenta Aprovar (Erro 403)');
    if (agendamentoId) {
      // Usa a rota correta que a dupla criou no agendamentoRoutes.js
      const userAprova = await req('PATCH', `/agendamentos/${agendamentoId}/aprovar`, null, tokenUser);
      
      if (userAprova.status === 403) {
        log.ok('Bloqueou user comum aprovar (403)');
      } else {
        log.fail(`Esperava 403, recebeu ${userAprova.status}`);
      }
    }

    console.log('\n================================');
    if (process.exitCode) {
      console.log('⚠️  ALGUNS TESTES FALHARAM. Revise os ❌ acima.');
    } else {
      console.log('🎉 TODOS OS TESTES PASSARAM! O Backend está redondo.');
    }
    console.log('================================\n');

  } catch (err) {
    console.error('❌ ERRO FATAL NO TESTE:', err.message);
    console.log('Certifique-se de que o servidor está rodando (node server.js)');
  }
}

run();