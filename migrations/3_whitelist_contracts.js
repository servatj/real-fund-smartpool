// ERC20 Tokens
const RealFundTokenERC20 = artifacts.require('./RealFundTokenERC20');

async function doDeploy(deployer, network, accounts) {
    const REALFUND = await RealFundTokenERC20.deployed();
    
    await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0x4e67bf5bD28Dd4b570FBAFe11D0633eCbA2754Ec'));
    await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0xC5570FC7C828A8400605e9843106aBD675006093'));
    await REALFUND.addToWhitelist(web3.utils.toChecksumAddress('0x8DBB8C9bFEb7689f16772c85136993cDA0c05eA4'));
}

module.exports = function(deployer, network, accounts) {
    deployer.then(async () => {
        await doDeploy(deployer, network, accounts);
    });
}