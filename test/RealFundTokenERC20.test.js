const { assert } = require('chai')
const RealFundTokenERC20 = artifacts.require('./RealFundTokenERC20.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

    contract('RealFundTokenERC20', (accounts) => {
        let contract = ''
    
        before(async () => {
            contract = await RealFundTokenERC20.deployed()
        })
    
        describe('deployment', async () => {
            it('deploys successfully', async () => {
                const address = contract.address
                assert.notEqual(address, 0x0)
                assert.notEqual(address, '')
                assert.notEqual(address, null)
                assert.notEqual(address, undefined)
            })
    
            it('has a name', async () => {
                const name = await contract.name()
                assert.equal(name, 'RealFund')
            })
    
            it('has a symbol', async () => {
                const symbol = await contract.symbol()
                assert.equal(symbol, 'RFD')
            })
    
            it('has a supply', async () => {
                const totalSupply = await contract.totalSupply()
                assert.equal(totalSupply, web3.utils.toWei('200000'))
            })

            it('has an owner', async () => {
                const owner = await contract.getOwner()
                assert.equal(owner, accounts[0])
            })
        })
    
        describe('whitelist checking', async () => {
            it('transfer should fail if user is not in the whitelist', async () => {
                await contract.transfer(accounts[2], web3.utils.toWei('1000')).should.be.rejected
                await contract.transferFrom(accounts[0], accounts[2], web3.utils.toWei('1000')).should.be.rejected
            })

            it('add user to whitelist', async () => {
                await contract.addToWhitelist(accounts[2]).should.be.fulfilled   
                const isWhitelisted = await contract.isWhitelisted(accounts[2])
                assert.equal(isWhitelisted, true)
            })

            it('transfer should work with an user in the whitelist', async () => {
                await contract.transfer(accounts[2], web3.utils.toWei('1000')).should.be.fulfilled
                await contract.transferFrom(accounts[0], accounts[2], web3.utils.toWei('1000')).should.be.fulfilled
                const balance = await contract.balanceOf(accounts[2])
                assert.equal(balance, web3.utils.toWei('2000'))
            })

            it('remove user from whitelist', async () => {
                await contract.removeFromWhitelist(accounts[2]).should.be.fulfilled
                const isWhitelisted = await contract.isWhitelisted(accounts[2])
                assert.equal(isWhitelisted, false)
                await contract.transfer(accounts[2], web3.utils.toWei('1000')).should.be.rejected
            })
        })
    })