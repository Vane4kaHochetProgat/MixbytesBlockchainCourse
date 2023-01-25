import {expect} from "chai";
import {keccak256} from "@ethersproject/keccak256";
import {toUtf8Bytes} from "@ethersproject/strings";
import {ethers} from "hardhat";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {MyFirstDao} from "../typechain-types";

async function deployDao() {
    const [voter1, voter2, voter3] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory("MyToken");
    const token = await tokenFactory.deploy()

    const daoFactory = await ethers.getContractFactory("MyFirstDao");
    const dao = await daoFactory.deploy(token.address)

    await token.connect(voter1).transfer(voter2.address, 31 * (10 ** 6))
    await token.connect(voter1).transfer(voter3.address, 32 * (10 ** 6))

    await token.connect(voter1).delegate(voter1.address)
    await token.connect(voter2).delegate(voter2.address)
    await token.connect(voter3).delegate(voter3.address)


    const voters = [voter1, voter2, voter3]
    return { voters, token, dao};
}

describe("Deployment", function () {

    it("Balances match up", async function () {
        const { voters, token } = await loadFixture(deployDao);

        expect(await token.balanceOf(voters[0].address)).to.equal(37 * 10 ** 6);
        expect(await token.balanceOf(voters[1].address)).to.equal(31 * 10 ** 6);
        expect(await token.balanceOf(voters[2].address)).to.equal(32 * 10 ** 6);
    });

    it("Can create proposal", async function () {
        const { dao, voters } = await loadFixture(deployDao);

        const prop = keccak256(toUtf8Bytes("proposal1"));
        await dao.connect(voters[0]).createProposal(prop);

        const [event] = await dao.queryFilter(dao.filters.NewProposal());

        expect(event.args.id).to.equal(prop);
    });

    it("Can't create same proposal for second time", async function () {
        const { dao, voters } = await loadFixture(deployDao);

        const prop = keccak256(toUtf8Bytes("Proposal 1"));

        await dao.connect(voters[0]).createProposal(prop);

        await expect(dao.connect(voters[0]).createProposal(prop)).to.be.revertedWith("You're trying to create existing proposal");
    });


});


describe("Vote", function () {
    it("Should be able to vote", async function () {
        const { voters, dao} = await loadFixture(deployDao);
        const proposals = [keccak256(toUtf8Bytes("proposal1")), keccak256(toUtf8Bytes("proposal2")), keccak256(toUtf8Bytes("proposal3"))];

        for (let i = 0; i < 3; i++) await dao.createProposal(proposals[i]);
        await dao.connect(voters[0]).vote(proposals[0], 12 * 10 ** 6, true);

        const [event] = await dao.queryFilter(dao.filters.Voting());

        expect(event.args.id).to.equal(proposals[0]);
        expect(event.args.amount).to.equal(12 * 10 ** 6);
        expect(event.args.agreed).to.equal(true);
    });

    it("Can't vote in non-existing proposal", async function () {
        const { dao, voters} = await loadFixture(deployDao);

        const prop = keccak256(toUtf8Bytes("proposal1"));

        await expect(dao.connect(voters[0]).vote(prop, 10 * 10 ** 6, true)).to.be.revertedWith("You're trying to vote in non-existing proposal");
    });


    it("Can't vote with money bigger than balance", async function () {
        const { dao, voters} = await loadFixture(deployDao);

        const prop = keccak256(toUtf8Bytes("proposal1"));
        await dao.connect(voters[0]).createProposal(prop);

        await expect(dao.connect(voters[0]).vote(prop, 100 * 10 ** 6, true)).to.be.revertedWith("You are trying to vote with money you don't have");
    });

});

describe("Vote result", async function () {
    it("Right result is reject", async function () {
        const { dao, voters} = await loadFixture(deployDao);

        const prop = keccak256(toUtf8Bytes("proposal12"));
        await dao.connect(voters[0]).createProposal(prop);


        await dao.connect(voters[0]).vote(prop, 26 * 10 ** 6, false);
        await dao.connect(voters[1]).vote(prop, 30 * 10 ** 6, false);

        const [event] = await dao.queryFilter(dao.filters.ProposalRejected());

        expect(event.args.id).to.equal(prop);
    })

    it("Right result is accept", async function () {
        const { dao, voters} = await loadFixture(deployDao);

        const prop = keccak256(toUtf8Bytes("proposal1"));
        await dao.connect(voters[0]).createProposal(prop);

        await dao.connect(voters[0]).vote(prop, 35 * 10 ** 6, true);
        await dao.connect(voters[1]).vote(prop, 30 * 10 ** 6, false);
        await dao.connect(voters[2]).vote(prop, 29 * 10 ** 6, true);

        const [event] = await dao.queryFilter(dao.filters.ProposalAccepted());

        expect(event.args.id).to.equal(prop);
    });


});