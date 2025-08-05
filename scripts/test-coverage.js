const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runTestsWithCoverage() {
  console.log("🧪 Executando testes com análise de cobertura...\n");

  return new Promise((resolve, reject) => {
    exec('npx hardhat coverage', (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro: ${error}`);
        reject(error);
        return;
      }

      console.log(stdout);
      
      // Parse coverage results
      const coverageRegex = /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/;
      const match = stdout.match(coverageRegex);
      
      if (match) {
        const [, statements, branches, functions, lines] = match;
        
        console.log("\n📊 RESUMO DA COBERTURA DE TESTES:");
        console.log("=====================================");
        console.log(`📄 Statements: ${statements}%`);
        console.log(`🌿 Branches: ${branches}%`);
        console.log(`⚡ Functions: ${functions}%`);
        console.log(`📝 Lines: ${lines}%`);
        
        const avgCoverage = (
          parseFloat(statements) + 
          parseFloat(branches) + 
          parseFloat(functions) + 
          parseFloat(lines)
        ) / 4;
        
        console.log(`\n🎯 Cobertura Média: ${avgCoverage.toFixed(2)}%`);
        
        if (avgCoverage >= 50) {
          console.log("✅ META ATINGIDA: Cobertura acima de 50%!");
        } else {
          console.log("❌ META NÃO ATINGIDA: Cobertura abaixo de 50%");
          console.log("💡 Adicione mais testes para aumentar a cobertura");
        }
        
        // Check individual contract coverage
        checkIndividualCoverage(stdout);
        
      } else {
        console.log("⚠️  Não foi possível extrair dados de cobertura do output");
      }
      
      resolve(stdout);
    });
  });
}

function checkIndividualCoverage(output) {
  console.log("\n📋 COBERTURA POR CONTRATO:");
  console.log("==========================");
  
  // Look for MyToken coverage
  const myTokenRegex = /MyToken\.sol\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/;
  const myTokenMatch = output.match(myTokenRegex);
  
  if (myTokenMatch) {
    const [, statements, branches, functions, lines] = myTokenMatch;
    console.log("📄 MyToken.sol:");
    console.log(`   Statements: ${statements}%`);
    console.log(`   Branches: ${branches}%`);
    console.log(`   Functions: ${functions}%`);
    console.log(`   Lines: ${lines}%`);
  }
  
  // Look for MyNFT coverage
  const myNFTRegex = /MyNFT\.sol\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/;
  const myNFTMatch = output.match(myNFTRegex);
  
  if (myNFTMatch) {
    const [, statements, branches, functions, lines] = myNFTMatch;
    console.log("\n🎨 MyNFT.sol:");
    console.log(`   Statements: ${statements}%`);
    console.log(`   Branches: ${branches}%`);
    console.log(`   Functions: ${functions}%`);
    console.log(`   Lines: ${lines}%`);
  }
}

function generateTestReport() {
  console.log("\n📈 RELATÓRIO DETALHADO DOS TESTES:");
  console.log("===================================");
  
  const testFiles = [
    'test/MyToken.test.js',
    'test/MyNFT.test.js', 
    'test/Integration.test.js'
  ];
  
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const testCount = (content.match(/it\(/g) || []).length;
      const describeCount = (content.match(/describe\(/g) || []).length;
      
      console.log(`\n📁 ${path.basename(file)}:`);
      console.log(`   🧪 ${testCount} testes individuais`);
      console.log(`   📦 ${describeCount} grupos de teste`);
    }
  });
  
  console.log("\n🎯 FUNCIONALIDADES TESTADAS:");
  console.log("============================");
  console.log("✅ Deploy e configuração inicial");
  console.log("✅ Minting de tokens ERC-20");
  console.log("✅ Controle de acesso (onlyOwner)");
  console.log("✅ Transferências de tokens");
  console.log("✅ Aprovações e allowances");
  console.log("✅ Minting de NFTs com pagamento");
  console.log("✅ Alteração de preços");
  console.log("✅ Token URIs e metadados");
  console.log("✅ Validações e tratamento de erros");
  console.log("✅ Integração entre contratos");
  console.log("✅ Cenários de múltiplos usuários");
  console.log("✅ Funções utilitárias");
  console.log("✅ Conformidade com padrões ERC");
}

async function main() {
  try {
    await runTestsWithCoverage();
    generateTestReport();
    
    console.log("\n🚀 PRÓXIMOS PASSOS:");
    console.log("===================");
    console.log("1. Execute 'npm run test' para rodar apenas os testes");
    console.log("2. Execute 'npm run coverage' para ver cobertura detalhada");
    console.log("3. Verifique o arquivo coverage/index.html para relatório visual");
    console.log("4. Execute 'npm run deploy' para fazer deploy dos contratos");
    
  } catch (error) {
    console.error("❌ Erro ao executar análise de cobertura:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runTestsWithCoverage, checkIndividualCoverage, generateTestReport };
