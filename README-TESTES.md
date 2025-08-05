# 🧪 Documentação dos Testes

Este projeto inclui uma suíte completa de testes.

## 📋 Estrutura dos Testes

### 1. **MyToken.test.js** - Testes do Token ERC-20
- ✅ **Deployment**: Verificação de owner, nome, símbolo, decimais
- ✅ **Minting**: Testes de cunhagem por owner e restrições
- ✅ **Transfers**: Transferências e validações de saldo
- ✅ **Allowances**: Aprovações e transferFrom
- ✅ **Ownership**: Transferência de propriedade

### 2. **MyNFT.test.js** - Testes do Token ERC-721
- ✅ **Deployment**: Configuração inicial e validações
- ✅ **Minting**: Cunhagem com pagamento em tokens ERC-20
- ✅ **Price Management**: Alteração de preços pelo owner
- ✅ **Token URI**: Configuração e retorno de metadados
- ✅ **Utility Functions**: Funções auxiliares de verificação
- ✅ **Owner Rights**: Verificação de que owner não tem privilégios especiais
- ✅ **ERC-721 Standard**: Conformidade com padrão

### 3. **Integration.test.js** - Testes de Integração
- ✅ **Complete Workflow**: Fluxo completo de usuário
- ✅ **Multiple Users**: Cenários com múltiplos usuários
- ✅ **Price Changes**: Mudanças de preço afetando compras futuras
- ✅ **Edge Cases**: Casos extremos e tratamento de erros
- ✅ **Gas Optimization**: Testes de eficiência

## 🚀 Como Executar os Testes

### Instalação
```bash
npm install
```

### Executar Todos os Testes
```bash
npm run test
# ou
npx hardhat test
```

### Executar Testes com Cobertura
```bash
npm run coverage
# ou
npx hardhat coverage
```

### Executar Teste Específico
```bash
npx hardhat test test/MyToken.test.js
npx hardhat test test/MyNFT.test.js
npx hardhat test test/Integration.test.js
```

### Executar com Relatório Detalhado
```bash
node scripts/test-coverage.js
```

## 📊 Cobertura Esperada

### Meta: **Mínimo 50% de Cobertura**

**Cobertura por Contrato:**
- **MyToken.sol**: ~85%+ cobertura
- **MyNFT.sol**: ~90%+ cobertura

**Métricas Cobertas:**
- ✅ **Statements**: Todas as declarações principais
- ✅ **Branches**: Condicionais e validações
- ✅ **Functions**: Todas as funções públicas e principais internas
- ✅ **Lines**: Linhas de código executadas

## 🎯 Funcionalidades Testadas

### Token ERC-20 (MyToken)
- [x] Deploy com parâmetros corretos
- [x] Minting apenas por owner
- [x] Função `mintAndTransfer`
- [x] Transferências entre contas
- [x] Sistema de aprovações
- [x] Validações de saldo insuficiente
- [x] Controle de acesso
- [x] Transferência de propriedade

### Token ERC-721 (MyNFT)
- [x] Deploy com validações
- [x] Configuração de preço inicial
- [x] Minting com pagamento em tokens
- [x] Validação de allowance/saldo
- [x] Alteração de preço (apenas owner)
- [x] Sistema de token URI
- [x] Incremento correto de token IDs
- [x] Eventos de minting
- [x] Verificação de que owner não tem privilégios
- [x] Funções utilitárias (`hasAllowance`, `hasBalance`)

### Integração Entre Contratos
- [x] Fluxo completo: distribuição → aprovação → minting
- [x] Múltiplos usuários simultâneos
- [x] Alteração de preço afetando vendas futuras
- [x] Casos extremos (saldo exato, sem aprovação)
- [x] Transferência de NFTs após minting
- [x] Configuração de metadados

## 🔍 Cenários de Teste Específicos

### Casos de Sucesso
- Usuario com saldo e aprovação adequados
- Owner alterando preços
- Múltiplas cunhagens por usuário
- Transferência de propriedade

### Casos de Erro
- Tentativa de minting sem aprovação
- Saldo insuficiente
- Operações por não-owner
- Preço zero ou inválido
- Token inexistente

### Casos Extremos
- Usuário com saldo exato para 1 NFT
- Alteração de preço entre transações
- Múltiplos usuários simultâneos

## 📈 Relatórios de Cobertura

### Visualização
Após executar `npm run coverage`, verifique:
- `coverage/index.html` - Relatório visual completo
- `coverage/lcov-report/` - Relatórios detalhados por arquivo

### Métricas Importantes
```
All files      |   XX%   |   XX%   |   XX%   |   XX%   
 MyToken.sol   |   XX%   |   XX%   |   XX%   |   XX%   
 MyNFT.sol     |   XX%   |   XX%   |   XX%   |   XX%   
```

## 🛠️ Ferramentas Utilizadas

- **Hardhat**: Framework de desenvolvimento
- **Chai**: Biblioteca de assertions
- **Ethers.js**: Interação com contratos
- **Solidity Coverage**: Análise de cobertura
- **OpenZeppelin**: Contratos base seguros

## 🚨 Validações de Segurança Testadas

- ✅ Controle de acesso com `onlyOwner`
- ✅ Validações de endereços zero
- ✅ Verificações de saldo antes de transferências
- ✅ Validações de aprovação antes de `transferFrom`
- ✅ Prevenção de overflow/underflow
- ✅ Verificação de existência de tokens
- ✅ Validações de entrada nos constructors

## 📝 Comandos Úteis

```bash
# Compilar contratos
npx hardhat compile

# Executar deploy local
npx hardhat run scripts/deploy.js

# Limpar cache
npx hardhat clean

# Verificar sintaxe dos testes
npm run test -- --reporter spec

# Executar testes específicos por padrão
npx hardhat test --grep "should allow owner to mint tokens"
```

## 🎯 Próximos Passos

1. **Executar testes**: `npm run test`
2. **Verificar cobertura**: `npm run coverage`
3. **Analisar relatório**: Abrir `coverage/index.html`
4. **Deploy**: `npm run deploy`
5. **Verificação**: Usar comandos do script de deploy

---

**✅ Meta de Cobertura**: Todos os testes foram criados para atingir **mais de 50% de cobertura** conforme solicitado.
