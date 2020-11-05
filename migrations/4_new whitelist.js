// ERC20 Tokens
const RealFundTokenERC20 = artifacts.require('./RealFundTokenERC20');

async function doDeploy(deployer, network, accounts) {
    const REALFUND = await RealFundTokenERC20.deployed();
    
    await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0x2641f150669739986CDa3ED6860DeD44BC3Cda5d'));
    console.log('DONE!!!!!');
}

module.exports = function(deployer, network, accounts) {
    deployer.then(async () => {
        await doDeploy(deployer, network, accounts);
    });
}