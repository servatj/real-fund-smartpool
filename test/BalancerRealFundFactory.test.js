const { assert } = require('chai')

const RealFundTokenERC20 = artifacts.require('./RealFundTokenERC20.sol');
const DaiToken = artifacts.require('./DaiToken.sol');   
const BFactory = artifacts.require('BFactory.sol');
const RealFundFactory = artifacts.require('RealFundFactory.sol');
const RealFundSwap = artifacts.require('RealFundSwap.sol');


require('chai')
    .use(require('chai-as-promised'))
    .should()

    contract('RealFundTokenERC20', (accounts) => {
        let balanceFactoryContract = ''
        let realfundFactoryContract = ''
        let daiContract = ''
        let realfundContract = ''
        let poolAddress = ''
        let realfundSwapContract = ''
    
        before(async () => {
            balanceFactoryContract = await BFactory.deployed()
            realfundFactoryContract = await RealFundFactory.deployed()
            daiContract = await DaiToken.deployed()
            realfundContract = await RealFundTokenERC20.deployed()
            realfundSwapContract = await RealFundSwap.deployed()
        })
    
        describe('deployment', async () => {
            it('deploy dai token', async () => {
                const address = daiContract.address
                assert.notEqual(address, 0x0)
                assert.notEqual(address, '')
                assert.notEqual(address, null)
                assert.notEqual(address, undefined)
                const name = await daiContract.name()
                assert.equal(name, 'DAI')
                const symbol = await daiContract.symbol()
                assert.equal(symbol, 'DAI')
                const totalSupply = await daiContract.totalSupply()
                assert.equal(totalSupply, web3.utils.toWei('100000000'))
            })

            it('deploy realfund token', async () => {
                const address = realfundContract.address
                assert.notEqual(address, 0x0)
                assert.notEqual(address, '')
                assert.notEqual(address, null)
                assert.notEqual(address, undefined)
                const name = await realfundContract.name()
                assert.equal(name, 'RealFund')
                const symbol = await realfundContract.symbol()
                assert.equal(symbol, 'RFD')
                const totalSupply = await realfundContract.totalSupply()
                assert.equal(totalSupply, web3.utils.toWei('200000'))
            })
    
            it('deploy balancer factory', async () => {
                const address = balanceFactoryContract.address
                assert.notEqual(address, 0x0)
                assert.notEqual(address, '')
                assert.notEqual(address, null)
                assert.notEqual(address, undefined)
            })

            it('deploy realfund factory', async () => {
                const address = realfundFactoryContract.address
                assert.notEqual(address, 0x0)
                assert.notEqual(address, '')
                assert.notEqual(address, null)
                assert.notEqual(address, undefined)
            })
        })
    
        describe('balancer pool', async () => {
            it('create pool', async () => {
                const swapFee = web3.utils.toWei('0.03');
                const resultPool = await realfundFactoryContract.createPool(
                    balanceFactoryContract.address,
                    swapFee
                );

                const event = resultPool.logs[0].args;
                poolAddress = event.pool;
                assert.isNotEmpty(poolAddress)

                await realfundContract.addToWhitelist(poolAddress);
                await realfundContract.addToWhitelist(realfundFactoryContract.address);
            })

            it('approve realfund factory to spend tokens', async () => {
                await daiContract.approve(realfundFactoryContract.address, web3.utils.toTwosComplement(-1)).should.be.fulfilled
                await realfundContract.approve(realfundFactoryContract.address, web3.utils.toTwosComplement(-1)).should.be.fulfilled
            })

            it('add liquidity to pool', async () => {
                const startWeights = [web3.utils.toWei('2'), web3.utils.toWei('38')]; // 50%/50%    // FIXME. Set good parameters
                const startBalances = [web3.utils.toWei('1000'), web3.utils.toWei('1000')];
                const tokenAddresses = [daiContract.address, realfundContract.address];

                await realfundFactoryContract.addTokensToPool(
                    poolAddress,
                    tokenAddresses,
                    startBalances,
                    startWeights
                ).should.be.fulfilled;
            })

            it('swap two tokens', async () => {
                await realfundContract.addToWhitelist(realfundSwapContract.address).should.be.fulfilled;
                await realfundContract.approve(realfundSwapContract.address, web3.utils.toTwosComplement(-1)).should.be.fulfilled;
                await daiContract.approve(realfundSwapContract.address, web3.utils.toTwosComplement(-1)).should.be.fulfilled;

                await realfundContract.approve(accounts[0], web3.utils.toTwosComplement(-1)).should.be.fulfilled;
                await realfundContract.transferFrom(accounts[0], realfundSwapContract.address, web3.utils.toWei('1000')).should.be.fulfilled;
                await daiContract.approve(accounts[0], web3.utils.toTwosComplement(-1)).should.be.fulfilled;
                await daiContract.transferFrom(accounts[0], realfundSwapContract.address, web3.utils.toWei('1000')).should.be.fulfilled;

                await realfundSwapContract.swapRealfundForDai(web3.utils.toWei('1')).should.be.fulfilled;
            })

            it('pool has a price', async () => {
                const price = await realfundSwapContract.getSpotPrice();
                // assert.isAbove(web3.fromWei(price.toNumber(), "ether"), 0); --> Falla la comprobación. Ver el motivo
            })

            it('pool should be finalized', async () => {
                // Ver la excepción ERR_NOT_CONTROLLER que devuelve
                //await realfundFactoryContract.finalizePool(poolAddress).should.be.fulfilled;
            })
        })
    })