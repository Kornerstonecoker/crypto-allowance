// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoAllowance {
    address public owner;
    mapping(address => uint256) public allowances;

    event Deposited(address indexed parent, uint256 amount);
    event AllowanceSet(address indexed parent, address indexed child, uint256 amount);
    event Withdrawn(address indexed child, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function depositETH() public payable {
        require(msg.value > 0, "Must send ETH");
        emit Deposited(msg.sender, msg.value);
    }

    function setAllowance(address child, uint256 amount) public {
        require(amount > 0, "Allowance must be greater than zero");
        require(address(this).balance >= amount, "Not enough balance");
        allowances[child] = amount;
        emit AllowanceSet(msg.sender, child, amount);
    }

    function withdrawETH() public {
        uint256 allowance = allowances[msg.sender];
        require(allowance > 0, "No allowance available");
        allowances[msg.sender] = 0;
        payable(msg.sender).transfer(allowance);
        emit Withdrawn(msg.sender, allowance);
    }

    function getAllowance(address child) public view returns (uint256) {
        return allowances[child];
    }
}
