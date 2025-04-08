// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistry {
    mapping(address => bool) public parents;
    mapping(address => bool) public children;

    event ParentRegistered(address parent);
    event ChildRegistered(address child);

    function registerParent() public {
        require(!parents[msg.sender], "Already registered as parent");
        parents[msg.sender] = true;
        emit ParentRegistered(msg.sender);
    }

    function registerChild() public {
        require(!children[msg.sender], "Already registered as child");
        children[msg.sender] = true;
        emit ChildRegistered(msg.sender);
    }

    function isParent(address user) public view returns (bool) {
        return parents[user];
    }

    function isChild(address user) public view returns (bool) {
        return children[user];
    }
}
