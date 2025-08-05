// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MyNFT
 * @dev Token ERC-721 não fungível que pode ser cunhado pagando com tokens ERC-20
 */
contract MyNFT is ERC721, Ownable {
    using Strings for uint256;
    
    // Endereço do contrato ERC-20 usado para pagamento
    IERC20 public immutable paymentToken;
    
    // Preço em tokens ERC-20 para cunhar um NFT
    uint256 public price;
    
    // Contador para IDs dos tokens
    uint256 private _tokenIdCounter;
    
    // URI base para os metadados
    string private _baseTokenURI;
    
    // Eventos
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 price);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    /**
     * @dev Constructor que define os parâmetros iniciais
     * @param tokenAddress Endereço do contrato ERC-20 usado para pagamento
     * @param _price Preço inicial para cunhar um NFT (em wei, considerando 18 decimais)
     * @param initialOwner Endereço do proprietário inicial do contrato
     */
    constructor(
        address tokenAddress, 
        uint256 _price,
        address initialOwner
    ) 
        ERC721("MyNFT", "MNFT") 
        Ownable(initialOwner)
    {
        require(tokenAddress != address(0), "Token address cannot be zero");
        require(_price > 0, "Price must be greater than zero");
        
        paymentToken = IERC20(tokenAddress);
        price = _price;
        _tokenIdCounter = 1; // Começar com ID 1
    }
    
    /**
     * @dev Função para cunhar NFT pagando com tokens ERC-20
     * Qualquer usuário pode chamar esta função
     * IMPORTANTE: O usuário deve ter aprovado o contrato NFT para gastar seus tokens ERC-20
     */
    function mint() external {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Transferir tokens ERC-20 do usuário para o owner do contrato NFT
        require(
            paymentToken.transferFrom(msg.sender, owner(), price),
            "Payment transfer failed"
        );
        
        // Cunhar o NFT para o usuário
        _safeMint(msg.sender, tokenId);
        
        emit NFTMinted(msg.sender, tokenId, price);
    }
    
    /**
     * @dev Função para o owner alterar o preço
     * Apenas o owner pode executar esta função
     * @param newPrice Novo preço em tokens ERC-20 (em wei, considerando 18 decimais)
     */
    function setPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than zero");
        
        uint256 oldPrice = price;
        price = newPrice;
        
        emit PriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Função para definir a URI base dos metadados
     * @param baseURI Nova URI base
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Função que retorna a URI dos metadados do token
     * @param tokenId ID do token
     * @return URI completa dos metadados
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        string memory baseURI = _baseTokenURI;
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }
    
    /**
     * @dev Função para obter o próximo ID de token que será cunhado
     * @return Próximo ID de token
     */
    function getNextTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Função para obter o total de tokens cunhados
     * @return Total de tokens cunhados
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    /**
     * @dev Função para verificar se um usuário tem allowance suficiente
     * @param user Endereço do usuário
     * @return True se o usuário tem allowance suficiente
     */
    function hasAllowance(address user) external view returns (bool) {
        return paymentToken.allowance(user, address(this)) >= price;
    }
    
    /**
     * @dev Função para verificar se um usuário tem saldo suficiente
     * @param user Endereço do usuário  
     * @return True se o usuário tem saldo suficiente
     */
    function hasBalance(address user) external view returns (bool) {
        return paymentToken.balanceOf(user) >= price;
    }
}
