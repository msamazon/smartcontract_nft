// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev Token ERC-20 fungível que permite apenas o owner cunhar e transferir tokens
 */
contract MyToken is ERC20, Ownable {
    
    /**
     * @dev Constructor que define o nome e símbolo do token
     * @param initialOwner Endereço do proprietário inicial do contrato
     */
    constructor(address initialOwner) 
        ERC20("MyToken", "MTK") 
        Ownable(initialOwner)
    {
        // Token criado com 18 casas decimais (padrão do ERC-20)
    }
    
    /**
     * @dev Função para cunhar e transferir tokens para uma conta específica
     * Apenas o owner pode executar esta função
     * @param to Endereço que receberá os tokens
     * @param amount Quantidade de tokens a serem cunhados (em wei, considerando 18 decimais)
     */
    function mintAndTransfer(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Função auxiliar para cunhar tokens diretamente
     * Apenas o owner pode executar esta função
     * @param to Endereço que receberá os tokens
     * @param amount Quantidade de tokens a serem cunhados
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
