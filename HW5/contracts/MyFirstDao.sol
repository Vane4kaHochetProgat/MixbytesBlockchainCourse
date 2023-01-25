// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyFirstDao {

    enum ProposalStatus {ACCEPTED, REJECTED, UNDECIDED}

    struct Vote {
        bool agreed;
        uint256 amount;
    }

    struct Proposal {
        bytes32 hashedId;
        ProposalStatus status;
        uint256 approveAmount;
        uint256 disapproveAmount;
        uint256 startTS;
        uint256 startBlock;
    }

    uint256 private constant MAX_PROPOSALS = 3;
    uint256 private constant DURATION = 3 days;

    Proposal[MAX_PROPOSALS + 1] private _proposals;

    mapping(bytes32 => uint256) private proposalIndices;

    mapping(uint256 => mapping(address => Vote)) private lastVotes;

    ERC20Votes private _votes;

    event NewProposal(bytes32 id);

    event Voting(bytes32 id, uint256 amount, bool agreed);

    event ProposalAccepted(bytes32 id);

    event ProposalRejected(bytes32 id);

    constructor(address votes) {
        _votes = ERC20Votes(votes);
    }

    function createProposal(bytes32 id) external {
        require(proposalIndices[id] == 0, "You're trying to create existing proposal");

        uint256 index = 0;
        for (uint256 i = 0; i < MAX_PROPOSALS; i++) {
            Proposal storage proposal = _proposals[i + 1];
            if ((block.timestamp >= proposal.startTS + DURATION) || proposal.status != ProposalStatus.UNDECIDED) {
                index = i + 1;
                break;
            }
        }
        _proposals[index] = Proposal({
        hashedId : id,
        status : ProposalStatus.UNDECIDED,
        approveAmount : 0,
        disapproveAmount : 0,
        startTS : block.timestamp,
        startBlock : block.number
        });
        proposalIndices[id] = index;
        emit NewProposal(id);
    }

    function vote(bytes32 id, uint256 amount, bool agreed) external {
        require(proposalIndices[id] > 0, "You're trying to vote in non-existing proposal");
        uint256 index = proposalIndices[id];
        Proposal storage proposal = _proposals[index];
        require(amount <= _votes.getVotes(msg.sender), "You are trying to vote with money you don't have");

        require(block.timestamp < proposal.startTS + DURATION, "You are too late");
        require(proposal.status == ProposalStatus.UNDECIDED, "Voting has ended");
        require(amount > 0, "Vote amount must be greater than 0");
        require(_votes.getPastVotes(msg.sender, proposal.startBlock) >= amount, "It's forbidden to increase vote amount");

        Vote storage last = lastVotes[index][msg.sender];
        proposal.approveAmount = (proposal.approveAmount + (agreed ? amount : 0)) - (last.agreed ? last.amount : 0);
        proposal.disapproveAmount = (proposal.disapproveAmount + (!agreed ? amount : 0)) - (!last.agreed ? last.amount : 0);
        uint256 supply = _votes.getPastTotalSupply(proposal.startBlock) / 2;
        if (proposal.approveAmount >= supply) {
            proposal.status = ProposalStatus.ACCEPTED;
            delete proposalIndices[proposal.hashedId];
            emit ProposalAccepted(proposal.hashedId);
        } else if (proposal.disapproveAmount >= supply) {
            proposal.status = ProposalStatus.REJECTED;
            delete proposalIndices[proposal.hashedId];
            emit ProposalRejected(proposal.hashedId);
        }
        emit Voting(id, amount, agreed);
        last.amount = amount;
        last.agreed = agreed;
    }


}