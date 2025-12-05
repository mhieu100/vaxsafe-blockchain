const VaxSafeIdentity = artifacts.require("VaxSafeIdentity");
const VaccineRecord = artifacts.require("VaccineRecord");

module.exports = (deployer) => {
	// Deploy VaxSafeIdentity contract
	deployer
		.deploy(VaxSafeIdentity)
		.then(() => {
			console.log("✅ VaxSafeIdentity deployed at:", VaxSafeIdentity.address);

			// Deploy VaccineRecord contract
			return deployer.deploy(VaccineRecord);
		})
		.then(() => {
			console.log("✅ VaccineRecord deployed at:", VaccineRecord.address);
		});
};
