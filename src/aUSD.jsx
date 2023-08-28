// main aUSD BOS app component

// 🟢
const ROUND_DOWN = 0;
const CONTRACT_ABI = {
  aUSD_ABI:
    "https://raw.githubusercontent.com/corndao/aave-v3-bos-app/main/abi/WrappedTokenGatewayV3ABI.json",
  erc20_stETH_ABI:
    "https://raw.githubusercontent.com/corndao/aave-v3-bos-app/main/abi/ERC20Permit.json",
  aUSD_Oracle_ABI:
    "https://raw.githubusercontent.com/corndao/aave-v3-bos-app/main/abi/AAVEPoolV3.json",
};
const CONTRACT_ADDRESS = fetch(
  "https://raw.githubusercontent.com/mr-harshtyagi/ausd-bos-app/main/contract_addresses.json"
);
const DEFAULT_CHAIN_ID = 11155111;
const NATIVE_SYMBOL_ADDRESS_MAP_KEY = "0x0";
const ETH_TOKEN = { name: "Ethereum", symbol: "ETH", decimals: 18 };
const WETH_TOKEN = { name: "Wrapped Ether", symbol: "WETH", decimals: 18 };

// App states
State.init({
  imports: {}, // 🔴
  chainId: undefined, // chainId is undefined in the case of unsupported chains
  isChainSupported: true,
  showDropdown: false,
  walletConnected: false,
  stEthBalance: "2", //deposit
  stEthPriceInUsd: "1700",
  depositAmount: "",
  depositAmountInUSD: "0.00",
  depositButtonLoading: false,
  depositedStEth: undefined, // withdraw
  depositedStEthInUSD: undefined,
  withdrawAmount: "",
  withdrawAmountInUSD: "0.00",
  withdrawButtonLoading: false,
  mintableaUSD: undefined, //mint
  mintableaUSDInUSD: undefined,
  mintAmount: "",
  mintAmountInUSD: "0.00",
  mintButtonLoading: false,
  mintedaUSD: undefined, // repay
  mintedaUSDInUSD: undefined,
  repayAmount: "",
  repayAmountInUSD: "0.00",
  repayButtonLoading: false,
  address: undefined,
  selectTab: "deposit", // deposit | withdraw | mint | repay
  totalDeposits: "1700",
  stablecoinApy: "8.33",
  healthFactor: "1.5",
  alertModalText: false,
});

// App config 🟢
function getConfig(network) {
  const chainId = state.chainId;
  switch (network) {
    case "testnet":
      return {
        ownerId: "aave-v3.near",
        nodeUrl: "https://rpc.mainnet.near.org",
        ipfsPrefix: "https://ipfs.near.social/ipfs",
        ...(chainId ? getNetworkConfig(chainId) : {}),
      };
    default:
      throw Error(`Unconfigured environment '${network}'.`);
  }
}

// Get aUSD network config by chain id 🟢
function getNetworkConfig(chainId) {
  const abis = {
    aUSD_ABI: fetch(CONTRACT_ABI.aUSD_ABI),
    erc20_stETH_ABI: fetch(CONTRACT_ABI.erc20_stETH_ABI),
    aUSD_Oracle_ABI: fetch(CONTRACT_ABI.aUSD_Oracle_ABI),
  };

  switch (chainId) {
    case 11155111: // Sepolia testnet
      return {
        chainName: "Sepolia Testnet",
        nativeCurrency: ETH_TOKEN,
        nativeWrapCurrency: WETH_TOKEN,
        rpcUrl: "https://rpc2.sepolia.org",
        aUSDAddress: CONTRACT_ADDRESS.aUSDAddress,
        erc20_stETHAddress: CONTRACT_ADDRESS.erc20_stETHAddress,
        aUSD_OracleAddress: CONTRACT_ADDRESS.aUSD_OracleAddress,
        ...abis,
      };
    default:
      throw new Error("unknown chain id");
  }
}

// Working 🟢
function switchEthereumChain(chainId) {
  const chainIdHex = `0x${chainId.toString(16)}`;
  const res = Ethers.send("wallet_switchEthereumChain", [
    { chainId: chainIdHex },
  ]);
  // If `res` === `undefined`, it means switch chain failed, which is very weird but it works.
  // If `res` is `null` the function is either not called or executed successfully.
  if (res === undefined) {
    console.log(
      `Failed to switch chain to ${chainId}. Add the chain to wallet`
    );
    const config = getNetworkConfig(chainId);
    Ethers.send("wallet_addEthereumChain", [
      {
        chainId: chainIdHex,
        chainName: config.chainName,
        nativeCurrency: config.nativeCurrency,
        rpcUrls: [config.rpcUrl],
      },
    ]);
  }
}

// Contract functions 🟢
function depositStETH(amount) {
  State.update({
    depositButtonLoading: true,
  });

  return (
    Ethers.provider()
      .getSigner()
      .getAddress()
      .then((address) => {
        // const aUSDContract = new ethers.Contract(
        //   "contract_address",
        //   "abi_contract",
        //   Ethers.provider().getSigner()
        // );
        // return aUSDContract.depositStETH("param1", "param2", "param3", {
        //   value: amount,
        // });

        // testing
        setTimeout(() => {
          onActionSuccess({
            msg: `You supplied ${Big(amount).toFixed(8)} ${"stETH"}`,
          });
          State.update({ depositButtonLoading: false });
        }, 2000);
      })
      // .then((tx) => {
      //   tx.wait()
      //     .then((res) => {
      //       const { status } = res;
      //       if (status === 1) {
      //         onActionSuccess({
      //           msg: `You supplied ${Big(amount).toFixed(8)} ${"stETH"}`,
      //         });
      //         console.log("tx succeeded", res);
      //       } else {
      //         console.log("tx failed", res);
      //         State.update({
      //           depositButtonLoading: false,
      //         });
      //       }
      //     })
      //     .catch(() => State.update({ depositButtonLoading: false }));
      // })
      .catch(() => State.update({ depositButtonLoading: false }))
  );
}

function withdrawStETH(amount) {
  State.update({
    withdrawButtonLoading: true,
  });

  return (
    Ethers.provider()
      .getSigner()
      .getAddress()
      .then((address) => {
        // const aUSDContract = new ethers.Contract(
        //   "contract_address",
        //   "abi_contract",
        //   Ethers.provider().getSigner()
        // );
        // return aUSDContract.depositStETH("param1", "param2", "param3", {
        //   value: amount,
        // });

        // testing
        setTimeout(() => {
          onActionSuccess({
            msg: `You supplied ${Big(amount).toFixed(8)} ${"stETH"}`,
          });
          State.update({ withdrawButtonLoading: false });
        }, 2000);
      })
      // .then((tx) => {
      //   tx.wait()
      //     .then((res) => {
      //       const { status } = res;
      //       if (status === 1) {
      //         onActionSuccess({
      //           msg: `You supplied ${Big(amount).toFixed(8)} ${"stETH"}`,
      //         });
      //         console.log("tx succeeded", res);
      //       } else {
      //         console.log("tx failed", res);
      //         State.update({
      //           depositButtonLoading: false,
      //         });
      //       }
      //     })
      //     .catch(() => State.update({ depositButtonLoading: false }));
      // })
      .catch(() => State.update({ withdrawButtonLoading: false }))
  );
}

function mint(amount) {
  State.update({
    mintButtonLoading: true,
  });

  return (
    Ethers.provider()
      .getSigner()
      .getAddress()
      .then((address) => {
        // const aUSDContract = new ethers.Contract(
        //   "contract_address",
        //   "abi_contract",
        //   Ethers.provider().getSigner()
        // );
        // return aUSDContract.depositStETH("param1", "param2", "param3", {
        //   value: amount,
        // });

        // testing
        setTimeout(() => {
          onActionSuccess({
            msg: `You supplied ${Big(amount).toFixed(8)} ${"stETH"}`,
          });
          State.update({ mintButtonLoading: false });
        }, 2000);
      })
      // .then((tx) => {
      //   tx.wait()
      //     .then((res) => {
      //       const { status } = res;
      //       if (status === 1) {
      //         onActionSuccess({
      //           msg: `You supplied ${Big(amount).toFixed(8)} ${"stETH"}`,
      //         });
      //         console.log("tx succeeded", res);
      //       } else {
      //         console.log("tx failed", res);
      //         State.update({
      //           depositButtonLoading: false,
      //         });
      //       }
      //     })
      //     .catch(() => State.update({ depositButtonLoading: false }));
      // })
      .catch(() => State.update({ mintButtonLoading: false }))
  );
}

function repay(amount) {
  State.update({
    repayButtonLoading: true,
  });

  return (
    Ethers.provider()
      .getSigner()
      .getAddress()
      .then((address) => {
        // const aUSDContract = new ethers.Contract(
        //   "contract_address",
        //   "abi_contract",
        //   Ethers.provider().getSigner()
        // );
        // return aUSDContract.depositStETH("param1", "param2", "param3", {
        //   value: amount,
        // });

        // testing
        setTimeout(() => {
          onActionSuccess({
            msg: `You supplied ${Big(amount).toFixed(8)} ${"stETH"}`,
          });
          State.update({ repayButtonLoading: false });
        }, 2000);
      })
      // .then((tx) => {
      //   tx.wait()
      //     .then((res) => {
      //       const { status } = res;
      //       if (status === 1) {
      //         onActionSuccess({
      //           msg: `You supplied ${Big(amount).toFixed(8)} ${"stETH"}`,
      //         });
      //         console.log("tx succeeded", res);
      //       } else {
      //         console.log("tx failed", res);
      //         State.update({
      //           depositButtonLoading: false,
      //         });
      //       }
      //     })
      //     .catch(() => State.update({ depositButtonLoading: false }));
      // })
      .catch(() => State.update({ mintButtonLoading: false }))
  );
}

// helpers
if (
  state.chainId === undefined &&
  ethers !== undefined &&
  Ethers.send("eth_requestAccounts", [])[0]
) {
  Ethers.provider()
    .getNetwork()
    .then((data) => {
      const chainId = data?.chainId;
      const config = getNetworkConfig(chainId);
      if (!config) {
        console.log(`Unsupport chain, chainId: ${chainId}`);
        State.update({ isChainSupported: false });
        switchEthereumChain(DEFAULT_CHAIN_ID);
      } else {
        State.update({ chainId, isChainSupported: true });
      }
    });
}

function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}

const config = getConfig("testnet");

// 🟡
const loading = !state.address;

// Import functions to state.imports
function importFunctions(imports) {
  if (loading) {
    State.update({
      imports,
    });
  }
}

// Define the modules you'd like to import
const modules = {
  number: `${config.ownerId}/widget/Utils.Number`,
  date: `${config.ownerId}/widget/Utils.Date`,
  data: `${config.ownerId}/widget/AAVE.Data`,
};

function checkProviderAndUpdateStates() {
  const provider = Ethers.provider();
  if (provider) {
    State.update({ walletConnected: true });
    console.log("wallet connected", state.walletConnected);
    updateDataAndAddress();
    console.log("wallet connected", state.address);
  } else {
    State.update({ walletConnected: false });
    console.log("wallet connected", state.walletConnected);
  }
}

function bigMin(_a, _b) {
  const a = Big(_a);
  const b = Big(_b);
  return a.gt(b) ? b : a;
}

function formatHealthFactor(healthFactor) {
  if (healthFactor === "∞") return healthFactor;
  if (!healthFactor || !isValid(healthFactor)) return "-";
  if (Number(healthFactor) === -1) return "∞";
  return Big(healthFactor).toFixed(2, ROUND_DOWN);
}

// function batchBalanceOf(chainId, userAddress, tokenAddresses, abi) {
//   const balanceProvider = new ethers.Contract(
//     config.balanceProviderAddress,
//     abi.body,
//     Ethers.provider().getSigner()
//   );

//   return balanceProvider.batchBalanceOf([userAddress], tokenAddresses);
// }

// update data in async manner
function updateDataAndAddress() {
  // check abi loaded
  if (
    Object.keys(CONTRACT_ABI)
      .map((key) => config[key])
      .filter((ele) => !!ele).length !== Object.keys(CONTRACT_ABI).length
  ) {
    return;
  }

  const provider = Ethers.provider();
  if (!provider) {
    return;
  }

  if (!state.address) {
    console.log("Wallet address not found");
    provider
      .getSigner()
      ?.getAddress()
      ?.then((address) => {
        State.update({ address: address });
      });
  }
}

function onActionSuccess({ msg, callback }) {
  // update UI after data has almost loaded

  State.update({ alertModalText: msg });
}

const getChainImage = (chainId) => {};

const toggleDropdown = disabled
  ? () => {}
  : () => State.update({ showDropdown: !state.showDropdown });

const ChainImage = () => {
  switch (state.chainId) {
    case 11155111:
      return SepoliEthImage;
    default:
      throw new Error("unknown chain id");
  }
};

checkProviderAndUpdateStates();
// if (state.walletConnected && state.chainId) {
//   updateData();
// }

const AUSDLogo = () => (
  <img
    height={25}
    className="logo"
    src={`https://raw.githubusercontent.com/mr-harshtyagi/ausd-bos-app/1657682b919b92878e17f35a62a787590da08258/src/Images/aUSD-LOGO.svg`}
  />
);

const DropdownImage = () => (
  <img
    className="dropdown-img"
    src={`${config.ipfsPrefix}/bafkreiexo22bzy2dnto7xlzee5dgz3mkb5smmpvzdgx7ed3clbw3ad3jsa`}
  />
);

const SepoliEthImage = () => (
  <img
    className="network-img"
    src={`${config.ipfsPrefix}/bafkreih7c6cip4ckunan7c3n5ckyf56mfnqmu7u5zgvxvhqvjsyf76kwxy`}
  />
);

// Styled Components
const Body = styled.div`
  padding: 24px 15px;
  background: #0e0e26;
  min-height: 100vh;
  color: white;
`;

const FlexContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 18px 15px;
  background: #151718;

  display: flex;
  justify-content: space-between;

  .web3-connect {
    font-size: 12px;
    font-weight: bold;

    display: grid;
    place-content: center;

    background: #262626;
    border-radius: 5px;
    border: 0;

    color: white;
    transition: all 300ms ease-in-out;
    &:hover {
      background: #262626;
      opacity: 0.5;
    }
    &:active {
      background: #262626 !important;
    }
  }
  .logo {
    color: white;
    scale: 7;
    margin-left: 42px;
  }
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: ${disabled ? "auto" : "pointer"};

  position: relative;

  .dropdown-pc {
    display: none;
    position: absolute;
    right: 0;
    top: 80px;
    min-width: 260px;

    background: #151718;
    padding: 20px 16px;
    border-radius: 10px;
    font-size: 12px;
    z-index: 1;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
  }

  .network-img {
    width: 16px;
    height: 16px;
    margin-left: 8px;
    transition: all 0.3s ease-in-out;
  }

  .dropdown-img {
    width: 16px;
    height: 16px;
    margin-left: 8px;
    transition: all 0.3s ease-in-out;

    transform: rotate(${() => (state.showDropdown ? "0deg" : "180deg")});
  }

  @media (min-width: 640px) {
    justify-content: center;

    img {
      height: 60px;
    }

    .network-img {
      width: 32px;
      height: 32px;
    }

    .dropdown-img {
      width: 32px;
      height: 32px;
    }

    .dropdown-pc {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .dropdown-pc-item {
      display: flex;
      align-items: center;

      div {
        margin-left: 10px;
      }
    }
  }
`;

const SwitchTitle = styled.div`
  color: white;

  font-size: 18px;
  margin-left: 8px;

  @media (min-width: 640px) {
    font-size: 36px;
    font-weight: bold;
  }
`;

const DropdownMobile = styled.div`
  position: fixed;
  z-index: 9999;

  height: 80vh;
  left: 0;
  bottom: 0;
  width: 100%;
  background: #151718;

  display: flex;
  flex-direction: column;
  gap: 20px;

  padding: 20px 12px;
  font-size: 12px;

  .dropdown-mobile-item {
    .dropdown-img {
      width: 32px;
      height: 32px;
    }
    font-size: 14px;
    display: flex;
    align-items: center;

    div {
      margin-left: 10px;
    }
  }

  @media (min-width: 640px) {
    display: none;
  }
`;

const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
`;

const HeroDataContainer = styled.div`
  margin-top: 40px;
  width: 100%;
  gap: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  @media (min-width: 640px) {
    width: auto;
    display: grid;
    grid-template-columns: 1fr 1fr ${showHealthFactor ? "1fr" : ""};
    gap: 90px;
    text-align: center;
  }
`;

const KVData = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (min-width: 640px) {
    width: auto;
    display: block;
  }

  .key {
    font-size: 14px;
    font-weight: 500;
    @media (min-width: 640px) {
      font-size: 14px;
    }
  }
  .value {
    font-size: 14px;
    font-weight: 700;
    @media (min-width: 640px) {
      font-size: 22px;
    }
  }
  .text-green {
    color: #2cffa7;
  }
`;

const heroData = [
  {
    name: "Total Deposit",
    value: `$ ${state.totalDeposits} `,
  },
  {
    name: "Stablecoin APY",
    value: `${state.stablecoinApy} %`,
  },

  {
    name: "Health Factor",
    value: `${state.healthFactor}`,
  },
].filter((element) => !!element);

const TabContainer = styled.div`
  background: #212233;

  display: flex;
  padding: 4px;
  border-radius: 10px;

  margin-top: 30px;

  @media (min-width: 640px) {
    max-width: 355px;
    margin: 0 auto;
    margin-top: 50px;
  }
`;

const TabItem = styled.div`
  flex: 1;
  height: 48px;

  display: grid;
  place-content: center;
  border-radius: 10px;

  ${(props) => props.selected && "background: #8247E5;"}
  ${(props) =>
    props.disabled &&
    `
    opacity: 0.3;
    cursor: not-allowed;
  `}

  font-size: 16px;
  font-weight: bold;

  transition: all 0.3s ease-in-out;
  ${(props) =>
    !props.selected &&
    `
    cursor: pointer;
    &:hover {
      background: #8247E5;
      opacity: 0.7;
    }
  `}
`;

const AlertModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Title = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const Description = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
  margin-bottom: 32px;
`;

const Right = () => (
  <img
    style={{ marginBottom: "12px" }}
    src={`${config.ipfsPrefix}/bafkreigjsujyien6eb5ml3hmfigwwcgkse3emc2e6fkdhwzjp7yw7zue3u`}
    width={80}
    height={80}
  />
);

// deposit section
const depositMaxValue = Big(state.stEthBalance).toFixed(3);

const depositButtonDisabled =
  !state.depositAmount ||
  !isValid(state.depositAmount) ||
  Number(state.depositAmount) === 0;

const changeDepositValue = (value) => {
  if (Number(value) > Number(depositMaxValue)) {
    value = depositMaxValue;
  }
  if (Number(value) < 0) {
    value = "0";
  }
  if (isValid(value)) {
    const amountInUSD = Big(value).mul(state.stEthPriceInUsd).toFixed(2);
    State.update({
      depositAmountInUSD: amountInUSD,
      depositAmount: value,
    });
  } else {
    State.update({
      depositAmountInUSD: "0.00",
    });
  }
  State.update({ depositAmount: value });
};

const DepositPrimaryButton = styled.button`
  border: 0;

  color: white;
  background: ${depositButtonDisabled ? "#36295C" : "#8247e5"};
  border-radius: 5px;

  height: 48px;
  width: 100%;

  font-size: 16px;
  font-weight: bold;

  transition: all 0.3s ease;

  &:disabled {
    cursor: not-allowed;
  }
`;

//withdraw section
const withdrawMaxValue = Big(state.stEthBalance).toFixed(3);

const withdrawButtonDisabled =
  !state.withdrawAmount ||
  !isValid(state.withdrawAmount) ||
  Number(state.withdrawAmount) === 0;

const changeWithdrawValue = (value) => {
  if (Number(value) > Number(withdrawMaxValue)) {
    value = withdrawMaxValue;
  }
  if (Number(value) < 0) {
    value = "0";
  }
  if (isValid(value)) {
    const amountInUSD = Big(value).mul(state.stEthPriceInUsd).toFixed(2);
    State.update({
      withdrawAmountInUSD: amountInUSD,
      withdrawAmount: value,
    });
  } else {
    State.update({
      withdrawAmountInUSD: "0.00",
    });
  }
  State.update({ withdrawAmount: value });
};

const WithdrawPrimaryButton = styled.button`
  border: 0;

  color: white;
  background: ${state.withdrawButtonLoading || withdrawButtonDisabled
    ? "#36295C"
    : "#8247e5"};
  border-radius: 5px;

  height: 48px;
  width: 100%;

  font-size: 16px;
  font-weight: bold;

  transition: all 0.3s ease;

  &:disabled {
    cursor: not-allowed;
  }
`;

//mint section
const mintMaxValue = Big(state.stEthBalance).toFixed(3);

const mintButtonDisabled =
  !state.mintAmount ||
  !isValid(state.mintAmount) ||
  Number(state.mintAmount) === 0;

const changeMintValue = (value) => {
  if (Number(value) > Number(mintMaxValue)) {
    value = mintMaxValue;
  }
  if (Number(value) < 0) {
    value = "0";
  }
  if (isValid(value)) {
    const amountInUSD = Big(value).mul(state.stEthPriceInUsd).toFixed(2);
    State.update({
      mintAmountInUSD: amountInUSD,
      mintAmount: value,
    });
  } else {
    State.update({
      mintAmountInUSD: "0.00",
    });
  }
  State.update({ mintAmount: value });
};

const MintPrimaryButton = styled.button`
  border: 0;

  color: white;
  background: ${state.mintButtonLoading || mintButtonDisabled
    ? "#36295C"
    : "#8247e5"};
  border-radius: 5px;

  height: 48px;
  width: 100%;

  font-size: 16px;
  font-weight: bold;

  transition: all 0.3s ease;

  &:disabled {
    cursor: not-allowed;
  }
`;

//repay section
const repayMaxValue = Big(state.stEthBalance).toFixed(3);

const repayButtonDisabled =
  !state.repayAmount ||
  !isValid(state.repayAmount) ||
  Number(state.repayAmount) === 0;

const changeRepayValue = (value) => {
  if (Number(value) > Number(repayMaxValue)) {
    value = repayMaxValue;
  }
  if (Number(value) < 0) {
    value = "0";
  }
  if (isValid(value)) {
    const amountInUSD = Big(value).mul(state.stEthPriceInUsd).toFixed(2);
    State.update({
      repayAmountInUSD: amountInUSD,
      repayAmount: value,
    });
  } else {
    State.update({
      repayAmountInUSD: "0.00",
    });
  }
  State.update({ repayAmount: value });
};

const RepayPrimaryButton = styled.button`
  border: 0;

  color: white;
  background: ${state.repayButtonLoading || repayButtonDisabled
    ? "#36295C"
    : "#8247e5"};
  border-radius: 5px;

  height: 48px;
  width: 100%;

  font-size: 16px;
  font-weight: bold;

  transition: all 0.3s ease;

  &:disabled {
    cursor: not-allowed;
  }
`;

const Loading = () => (
  <img
    width={40}
    height={20}
    src={`${config.ipfsPrefix}/bafkreib3s7t6npgjqrplyduxbcrnpx7rnncxzgmsgp5smo3byms272jkgm`}
  />
);

function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}

const WithdrawContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TokenTexture = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: white;
`;

const TokenWrapper = styled.div`
  display: flex;
  img {
    margin-right: 4px;
  }
`;

const GrayTexture = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #7c7c86;
`;

const PurpleTexture = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #8a8db9;
`;

const GreenTexture = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #2cffa7;
`;

const RedTexture = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: red;
`;

const WhiteTexture = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: white;
`;
const TransactionOverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  background: transparent;
  border: none;
  outline: none;

  font-size: 20px;
  font-weight: bold;
  color: white;
  flex: 1;
  width: 160px;

  &[type="number"]::-webkit-outer-spin-button,
  &[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const Max = styled.span`
  color: #8247e5;
  cursor: pointer;
`;
const FlexBetweenContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const GenericTitle = styled.div`
  font-size: 14px;
  font-weight: 500;

  margin-bottom: 10px;
`;

const Content = styled.div`
  padding: 18px 14px;
  background: rgba(0, 0, 0, 0.26);
  border: 1px solid #383947;
  border-radius: 10px;
`;

// Component body
const body = loading ? (
  <>
    {/* Widget to replace 🟢 */}
    <Header>
      <AUSDLogo />
      <Web3Connect className="web3-connect" connectLabel="Connect Wallet" />
    </Header>
    <Body>
      {state.walletConnected
        ? state.isChainSupported
          ? "Loading..."
          : `Please switch network to ${
              getNetworkConfig(DEFAULT_CHAIN_ID).chainName
            }`
        : "Need to connect wallet first."}
    </Body>
  </>
) : (
  <>
    {/* Widget to replace 🟢 */}
    <Header>
      <AUSDLogo />
      <Web3Connect className="web3-connect" connectLabel="Connect Wallet" />
    </Header>
    <Body>
      <FlexContainer>
        {/* Widget to replace 🟢 */}
        <SwitchContainer>
          {state.showDropdown && (
            <DropdownMobile>
              <div>Select aUSD Market</div>
              <div
                className="dropdown-mobile-item"
                onClick={() => {
                  State.update({ showDropdown: false });
                  switchEthereumChain(11155111);
                }}
              >
                <SepoliEthImage />
                <div>Sepolia Testnet</div>
              </div>
            </DropdownMobile>
          )}
          <DropdownContainer onClick={toggleDropdown}>
            <ChainImage />
            <SwitchTitle>{config.chainName}</SwitchTitle>
            {!disabled && <DropdownImage />}
          </DropdownContainer>
          {state.showDropdown && (
            <div className="dropdown-pc">
              <div>Select aUSD Market</div>
              <div
                className="dropdown-pc-item"
                onClick={() => {
                  State.update({ showDropdown: false });
                  switchEthereumChain(11155111);
                }}
              >
                <SepoliEthImage />
                <div>Sepolia Testnet</div>
              </div>
            </div>
          )}
        </SwitchContainer>

        {/* Widget to replace 🟢 */}
        <HeroDataContainer>
          {heroData.map((row) => (
            <KVData key={row.name}>
              <div className="key">{row.name}</div>
              <div
                className={[
                  "value",
                  row.name === "Health Factor" ? "text-green" : undefined,
                ]
                  .filter((value) => !!value)
                  .join(" ")}
              >
                {row.value}
              </div>
            </KVData>
          ))}
        </HeroDataContainer>
      </FlexContainer>

      {/* Widget to replace 🟢 */}
      <TabContainer>
        <TabItem
          selected={state.selectTab === "deposit"}
          onClick={() => State.update({ selectTab: "deposit" })}
        >
          Deposit
        </TabItem>
        <TabItem
          selected={state.selectTab === "withdraw"}
          onClick={() => State.update({ selectTab: "withdraw" })}
        >
          Withdraw
        </TabItem>
        <TabItem
          selected={state.selectTab === "mint"}
          onClick={() => State.update({ selectTab: "mint" })}
        >
          Mint
        </TabItem>
        <TabItem
          selected={state.selectTab === "repay"}
          onClick={() => State.update({ selectTab: "repay" })}
        >
          Repay
        </TabItem>
      </TabContainer>

      {state.selectTab === "deposit" && (
        <>
          {/* Add prebuilt component to replace 🟡 */}
          {state.address ? (
            <>
              <GenericTitle>Amount to Deposit</GenericTitle>
              <Content>
                {" "}
                <>
                  <FlexBetweenContainer>
                    <TokenTexture>
                      <Input
                        type="number"
                        value={state.depositAmount}
                        onChange={(e) => {
                          changeDepositValue(e.target.value);
                        }}
                        placeholder="0"
                      />
                    </TokenTexture>

                    <TokenWrapper>
                      <img
                        width={26}
                        height={26}
                        src={`https://raw.githubusercontent.com/mr-harshtyagi/ausd-bos-app/3dde1f2a96c5b66a08009e58c3f18ee229a83300/src/Images/stETH.svg`}
                      />
                      <TokenTexture>{"stETH"}</TokenTexture>
                    </TokenWrapper>
                  </FlexBetweenContainer>
                  <FlexBetweenContainer>
                    <GrayTexture>${state.depositAmountInUSD}</GrayTexture>
                    <GrayTexture>
                      Wallet Balance:{" "}
                      {isValid(state.stEthBalance) && state.stEthBalance !== "-"
                        ? Big(state.stEthBalance).toFixed(7)
                        : state.stEthBalance}
                      <Max
                        onClick={() => {
                          changeDepositValue(depositMaxValue);
                        }}
                      >
                        MAX
                      </Max>
                    </GrayTexture>
                  </FlexBetweenContainer>
                </>
              </Content>
              <br />
              <DepositPrimaryButton
                onClick={() => depositStETH(state.depositAmount)}
                disabled={depositButtonDisabled}
              >
                {state.depositButtonLoading ? <Loading /> : "Deposit"}
              </DepositPrimaryButton>
            </>
          ) : (
            <div>Need to connect wallet first.</div>
          )}
        </>
      )}
      {state.selectTab === "withdraw" && (
        <>
          {/* Add prebuilt component to replace 🟡 */}
          {state.address ? (
            <>
              <GenericTitle>Amount to Withdraw</GenericTitle>
              <Content>
                {" "}
                <>
                  <FlexBetweenContainer>
                    <TokenTexture>
                      <Input
                        type="number"
                        value={state.withdrawAmount}
                        onChange={(e) => {
                          changeWithdrawValue(e.target.value);
                        }}
                        placeholder="0"
                      />
                    </TokenTexture>

                    <TokenWrapper>
                      <img
                        width={26}
                        height={26}
                        src={`https://raw.githubusercontent.com/mr-harshtyagi/ausd-bos-app/3dde1f2a96c5b66a08009e58c3f18ee229a83300/src/Images/stETH.svg`}
                      />
                      <TokenTexture>{"stETH"}</TokenTexture>
                    </TokenWrapper>
                  </FlexBetweenContainer>
                  <FlexBetweenContainer>
                    <GrayTexture>${state.withdrawAmountInUSD}</GrayTexture>
                    <GrayTexture>
                      Wallet Balance:{" "}
                      {isValid(state.stEthBalance) && state.stEthBalance !== "-"
                        ? Big(state.stEthBalance).toFixed(7)
                        : state.stEthBalance}
                      <Max
                        onClick={() => {
                          changeWithdrawValue(withdrawMaxValue);
                        }}
                      >
                        MAX
                      </Max>
                    </GrayTexture>
                  </FlexBetweenContainer>
                </>
              </Content>
              <br />
              <WithdrawPrimaryButton
                onClick={() => withdrawStETH(state.withdrawAmount)}
                disabled={state.withdrawButtonLoading || withdrawButtonDisabled}
              >
                {state.withdrawButtonLoading ? <Loading /> : "Withdraw"}
              </WithdrawPrimaryButton>
            </>
          ) : (
            <div>Need to connect wallet first.</div>
          )}
        </>
      )}
      {state.selectTab === "mint" && (
        <>
          {/* Add prebuilt component to replace 🟡 */}
          {state.address ? (
            <>
              <GenericTitle>Amount to Mint</GenericTitle>
              <Content>
                {" "}
                <>
                  <FlexBetweenContainer>
                    <TokenTexture>
                      <Input
                        type="number"
                        value={state.mintAmount}
                        onChange={(e) => {
                          changeMintValue(e.target.value);
                        }}
                        placeholder="0"
                      />
                    </TokenTexture>

                    <TokenWrapper>
                      <img
                        width={26}
                        height={26}
                        src={`https://raw.githubusercontent.com/mr-harshtyagi/ausd-bos-app/3dde1f2a96c5b66a08009e58c3f18ee229a83300/src/Images/aUSD.svg`}
                      />
                      <TokenTexture>{"stETH"}</TokenTexture>
                    </TokenWrapper>
                  </FlexBetweenContainer>
                  <FlexBetweenContainer>
                    <GrayTexture>${state.mintAmountInUSD}</GrayTexture>
                    <GrayTexture>
                      Wallet Balance:{" "}
                      {isValid(state.stEthBalance) && state.stEthBalance !== "-"
                        ? Big(state.stEthBalance).toFixed(7)
                        : state.stEthBalance}
                      <Max
                        onClick={() => {
                          changeMintValue(mintMaxValue);
                        }}
                      >
                        MAX
                      </Max>
                    </GrayTexture>
                  </FlexBetweenContainer>
                </>
              </Content>
              <br />
              <MintPrimaryButton
                onClick={() => mint(state.mintAmount)}
                disabled={state.mintButtonLoading || mintButtonDisabled}
              >
                {state.mintButtonLoading ? <Loading /> : "Mint"}
              </MintPrimaryButton>
            </>
          ) : (
            <div>Need to connect wallet first.</div>
          )}
        </>
      )}
      {state.selectTab === "repay" && (
        <>
          {/* Add prebuilt component to replace 🟡 */}
          {state.address ? (
            <>
              <GenericTitle>Amount to Repay</GenericTitle>
              <Content>
                {" "}
                <>
                  <FlexBetweenContainer>
                    <TokenTexture>
                      <Input
                        type="number"
                        value={state.repayAmount}
                        onChange={(e) => {
                          changeRepayValue(e.target.value);
                        }}
                        placeholder="0"
                      />
                    </TokenTexture>

                    <TokenWrapper>
                      <img
                        width={26}
                        height={26}
                        src={`https://raw.githubusercontent.com/mr-harshtyagi/ausd-bos-app/3dde1f2a96c5b66a08009e58c3f18ee229a83300/src/Images/aUSD.svg`}
                      />
                      <TokenTexture>{"stETH"}</TokenTexture>
                    </TokenWrapper>
                  </FlexBetweenContainer>
                  <FlexBetweenContainer>
                    <GrayTexture>${state.repayAmountInUSD}</GrayTexture>
                    <GrayTexture>
                      Wallet Balance:{" "}
                      {isValid(state.stEthBalance) && state.stEthBalance !== "-"
                        ? Big(state.stEthBalance).toFixed(7)
                        : state.stEthBalance}
                      <Max
                        onClick={() => {
                          changeRepayValue(repayMaxValue);
                        }}
                      >
                        MAX
                      </Max>
                    </GrayTexture>
                  </FlexBetweenContainer>
                </>
              </Content>
              <br />
              <RepayPrimaryButton
                onClick={() => repay(state.repayAmount)}
                disabled={state.repayButtonLoading || repayButtonDisabled}
              >
                {state.repayButtonLoading ? <Loading /> : "Repay"}
              </RepayPrimaryButton>
            </>
          ) : (
            <div>Need to connect wallet first.</div>
          )}
        </>
      )}
      {/* Widget to replace 🟡 */}
      {state.alertModalText && (
        <Widget
          src={`${config.ownerId}/widget/AAVE.Modal.AlertModal`}
          props={{
            config,
            title: "All done!",
            description: state.alertModalText,
            onRequestClose: () => State.update({ alertModalText: false }),
          }}
        />
      )}
    </Body>
  </>
);

return (
  <div>
    {/* Component Head */}
    <Widget
      src={`${config.ownerId}/widget/Utils.Import`}
      props={{ modules, onLoad: importFunctions }}
    />
    {/* Component Body */}
    {body}
  </div>
);
