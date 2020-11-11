// ERC20 Tokens
const RealFundTokenERC20 = artifacts.require('./RealFundTokenERC20');

async function doDeploy(deployer, network, accounts) {
    const REALFUND = await RealFundTokenERC20.deployed();
    
    // Research why is needed to add two times in the whitelist this address
    await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0x2641f150669739986CDa3ED6860DeD44BC3Cda5d'));
}

module.exports = function(deployer, network, accounts) {
    deployer.then(async () => {
        await doDeploy(deployer, network, accounts);
    });
}