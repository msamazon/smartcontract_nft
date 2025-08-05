# smartcontract_nft
Smart Contract criado para atender a disciplina de DApps, Desenvolvimento Full Stack e Smart Contracts

# Guia de Deploy e Uso dos Contratos

## 1. Instalação das Dependências

```bash
npm install @openzeppelin/contracts
```

## 2. Deploy dos Contratos

### Passo 1: Deploy do Token ERC-20, projeto MyToken
```solidity
// Parâmetros do constructor:
// - initialOwner: endereço que será o owner do contrato

MyToken token = new MyToken(0xYourOwnerAddress);
```

### Passo 2: Deploy do NFT ERC-721, porjeto MyNFT
```solidity
// Parâmetros do constructor:
// - tokenAddress: endereço do contrato ERC-20 deployado
// - _price: preço em wei (ex: 100 * 10^18 para 100 tokens)
// - initialOwner: endereço que será o owner do contrato

MyNFT nft = new MyNFT(
    0xTokenContractAddress, 
    100000000000000000000, // 100 tokens (100 * 10^18)
    0xYourOwnerAddress
);
```

## 3. Configuração Inicial

### Cunhar tokens ERC-20 para usuários
```solidity
// Apenas o owner pode executar
token.mintAndTransfer(userAddress, 1000 * 10**18); // 1000 tokens
```

### Configurar URI base para metadados
```solidity
// Apenas o owner pode executar
nft.setBaseURI("https://api.example.com/metadata/");
```

## 4. Fluxo de Uso para Cunhar NFT

### Para o usuário cunhar um NFT:

1. **Aprovar o contrato NFT para gastar tokens:**
```solidity
token.approve(nftContractAddress, price);
```

2. **Cunhar o NFT:**
```solidity
nft.mint();
```

## 5. Funções Utilitárias

### Verificar saldo do usuário
```solidity
uint256 balance = token.balanceOf(userAddress);
```

### Verificar allowance
```solidity
uint256 allowance = token.allowance(userAddress, nftContractAddress);
```

### Verificar preço atual
```solidity
uint256 currentPrice = nft.price();
```

### Alterar preço (apenas owner)
```solidity
nft.setPrice(200 * 10**18); // 200 tokens
```

## 6. Estrutura dos Metadados

Os metadados devem ser hospedados em uma URL acessível e seguir o padrão OpenSea. Por exemplo:

- Token ID 1: `https://api.example.com/metadata/1.json`
- Token ID 2: `https://api.example.com/metadata/2.json`

Cada arquivo JSON deve conter as informações do NFT conforme o exemplo fornecido.

## 7. Eventos Importantes

### NFTMinted
```solidity
event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 price);
```

### PriceUpdated
```solidity
event PriceUpdated(uint256 oldPrice, uint256 newPrice);
```

## 8. Considerações de Segurança

- ✅ O owner do NFT não pode cunhar NFTs arbitrariamente
- ✅ Apenas o owner pode alterar o preço
- ✅ Apenas o owner pode cunhar tokens ERC-20
- ✅ Verificações de saldo e allowance implementadas
- ✅ Uso de `_safeMint` para segurança
- ✅ Validações de endereço zero e valores inválidos
