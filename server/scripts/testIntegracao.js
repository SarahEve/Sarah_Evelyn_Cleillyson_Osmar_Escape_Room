require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const Sala = require('../models/Sala');
const Agendamento = require('../models/Agendamento');

const log = {
  ok:    (m) => console.log(`✅ ${m}`),
  fail:  (m) => { console.log(`❌ ${m}`); process.exitCode = 1; },
  info:  (m) => console.log(`ℹ️  ${m}`),
  title: (m) => console.log(`\n🔹 ${m}`),
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log.ok('Conectado ao MongoDB Atlas');

    // ============ LIMPEZA ============
    log.title('Limpando dados de teste anteriores');
    await Agendamento.deleteMany({ hora: '14:00' });
    await Usuario.deleteOne({ email: 'teste.integracao@scaperoom.com' });
    await Sala.deleteOne({ nome: 'Sala Teste Integração' });
    log.ok('Dados de teste limpos');

    // ============ 1. USUARIO ============
    log.title('1. Criando Usuario');
    const user = await Usuario.create({
      nome: 'Usuário Teste',
      email: 'teste.integracao@scaperoom.com',
      senha: 'senha123',
    });
    log.ok(`Usuario criado: ${user._id}`);

    // 1a. select:false — find() NÃO deve trazer senha
    const userSemSenha = await Usuario.findById(user._id);
    if (userSemSenha.senha) {
      log.fail('select:false NÃO funcionou — senha veio no find()');
    } else {
      log.ok('select:false funcionou (find() não traz senha)');
    }

    // 1b. toJSON() — res.json() no controller chama isso
    const userJSON = userSemSenha.toJSON();
    if ('senha' in userJSON) {
      log.fail('toJSON() NÃO removeu a senha');
    } else {
      log.ok('toJSON() removeu a senha');
    }

    // 1c. select('+senha') — único jeito de trazer o hash (necessário no login)
    const userComSenha = await Usuario.findById(user._id).select('+senha');
    if (userComSenha.senha && /^\$2[aby]\$/.test(userComSenha.senha)) {
      log.ok('select("+senha") traz o hash (para o login)');
    } else {
      log.fail('select("+senha") não trouxe o hash');
    }

    // 1d. compararSenha
    const senhaOk = await userComSenha.compararSenha('senha123');
    const senhaErrada = await userComSenha.compararSenha('errada');
    if (senhaOk && !senhaErrada) log.ok('compararSenha() funciona (true/false)');
    else log.fail('compararSenha() com problema');

    // 1e. role padrão
    if (user.role === 'user') log.ok('role padrão = "user"');
    else log.fail(`role padrão errado: ${user.role}`);

    // 1f. email duplicado bloqueado
    try {
      await Usuario.create({
        nome: 'Outro',
        email: 'teste.integracao@scaperoom.com',
        senha: 'outrasenha',
      });
      log.fail('Email duplicado foi aceito!');
    } catch (e) {
      log.ok('Email duplicado bloqueado (unique)');
    }

    // ============ 2. SALA ============
    log.title('2. Criando Sala');
    const sala = await Sala.create({
      nome: 'Sala Teste Integração',
      capacidade: 4,
      descricao: 'Sala para teste',
    });
    log.ok(`Sala criada: ${sala._id}`);

    if (sala.ativo === true) log.ok('ativo padrão = true');
    else log.fail('ativo padrão errado');

    try {
      await Sala.create({ nome: 'Sala Bug', capacidade: -1 });
      log.fail('Capacidade negativa foi aceita!');
    } catch (e) {
      log.ok('Validação de capacidade negativa bloqueou');
    }

    try {
      await Sala.create({ nome: 'Sala Teste Integração', capacidade: 4 });
      log.fail('Nome duplicado foi aceito!');
    } catch (e) {
      log.ok('Nome duplicado bloqueado (unique)');
    }

    // ============ 3. AGENDAMENTO ============
    log.title('3. Criando Agendamento');
    const dataFutura = new Date();
    dataFutura.setUTCDate(dataFutura.getUTCDate() + 30);
    const dataStr = dataFutura.toISOString().split('T')[0];

    const ag = await Agendamento.create({
      usuario: user._id,
      sala: sala._id,
      data: dataStr,
      hora: '14:00',
    });
    log.ok(`Agendamento criado: ${ag._id}`);
    log.info(`data normalizada: ${ag.data.toISOString()}`);
    log.ok(`status padrão = ${ag.status}`);

    if (ag.data.toISOString() === `${dataStr}T00:00:00.000Z`) {
      log.ok('Data normalizada para meia-noite UTC');
    } else {
      log.fail('Data NÃO foi normalizada!');
    }

    try {
      await Agendamento.create({
        usuario: user._id,
        sala: sala._id,
        data: dataStr,
        hora: '25:00',
      });
      log.fail('Hora inválida foi aceita!');
    } catch (e) {
      log.ok('Hora inválida bloqueada (regex HH:mm)');
    }

    try {
      await Agendamento.create({
        usuario: user._id,
        sala: sala._id,
        data: '2020-01-01',
        hora: '10:00',
      });
      log.fail('Data passada foi aceita!');
    } catch (e) {
      log.ok('Data passada bloqueada');
    }

    // ============ 4. CONFLITO DE HORÁRIO ============
    log.title('4. Testando conflito de horário (mesmo dia/sala/hora)');
    try {
      await Agendamento.create({
        usuario: user._id,
        sala: sala._id,
        data: dataStr,
        hora: '14:00',
      });
      log.fail('Conflito NÃO foi bloqueado!');
    } catch (e) {
      if (e.code === 11000) log.ok('Conflito bloqueado (E11000 - índice único)');
      else log.fail(`Conflito deu erro diferente: ${e.message}`);
    }

    // 4b. cancelar libera o horário (partialFilterExpression)
    log.title('4b. Cancelar deve liberar o horário');
    ag.status = 'cancelado';
    await ag.save();

    try {
      const novo = await Agendamento.create({
        usuario: user._id,
        sala: sala._id,
        data: dataStr,
        hora: '14:00',
      });
      log.ok(`Cancelado liberou o horário — novo agendamento: ${novo._id}`);
      // limpa o novo para não afetar próximos testes
      await novo.deleteOne();
    } catch (e) {
      log.fail(`Cancelado NÃO liberou o horário: ${e.message}`);
    }

    // ============ 5. POPULATE ============
    log.title('5. Testando populate (relacionamentos)');
    // cria um agendamento novo (o anterior foi cancelado)
    const ag2 = await Agendamento.create({
      usuario: user._id,
      sala: sala._id,
      data: dataStr,
      hora: '16:00',
    });

    const agPopulado = await Agendamento.findById(ag2._id)
      .populate('usuario', 'nome email role')
      .populate('sala', 'nome capacidade');

    if (agPopulado.usuario && agPopulado.usuario.email === 'teste.integracao@scaperoom.com') {
      log.ok(`populate('usuario') → ${agPopulado.usuario.nome} <${agPopulado.usuario.email}>`);
    } else {
      log.fail('populate usuario falhou');
    }

    if (agPopulado.sala && agPopulado.sala.nome === 'Sala Teste Integração') {
      log.ok(`populate('sala') → ${agPopulado.sala.nome} (cap. ${agPopulado.sala.capacidade})`);
    } else {
      log.fail('populate sala falhou');
    }

    // ============ 6. ÍNDICES ============
    log.title('6. Verificando índices do Agendamento');
    const indexes = await Agendamento.collection.indexes();
    indexes.forEach((idx) =>
      log.info(`índice: ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''}`)
    );

    const temIndice = indexes.some(
      (idx) => idx.key.sala === 1 && idx.key.data === 1 && idx.key.hora === 1
    );
    if (temIndice) log.ok('Índice (sala, data, hora) existe');
    else log.fail('Índice (sala, data, hora) NÃO existe — rode syncIndexes()');

    const temPartial = indexes.some(
      (idx) => idx.partialFilterExpression
    );
    if (temPartial) log.ok('Índice tem partialFilterExpression');
    else log.fail('Índice está SEM partialFilterExpression — vai bloquear cancelados');

    // ============ RESUMO ============
    log.title('RESUMO');
    log.ok(`Usuario: ${await Usuario.countDocuments()}`);
    log.ok(`Sala:    ${await Sala.countDocuments()}`);
    log.ok(`Agendamento: ${await Agendamento.countDocuments()}`);

    if (process.exitCode) {
      console.log('\n⚠️  Teste terminou com FALHAS. Revise os ❌ acima.');
    } else {
      console.log('\n🎉 Teste de integração concluído com SUCESSO!');
    }

  } catch (err) {
    console.error('\n❌ ERRO NO TESTE:', err.message);
    if (err.errors) {
      Object.entries(err.errors).forEach(([k, v]) => console.error(`   - ${k}: ${v.message}`));
    }
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado');
  }
})();