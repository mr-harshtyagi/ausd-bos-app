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
const DEFAULT_CHAIN_ID = 11155111;
const NATIVE_SYMBOL_ADDRESS_MAP_KEY = "0x0";
const ETH_TOKEN = { name: "Ethereum", symbol: "ETH", decimals: 18 };
const WETH_TOKEN = { name: "Wrapped Ether", symbol: "WETH", decimals: 18 };

// Get aUSD network config by chain id 🟢
function getNetworkConfig(chainId) {
  const abis = {
    aUSD_ABI: fetch(CONTRACT_ABI.aUSD_ABI),
    erc20_stETH_ABI: fetch(CONTRACT_ABI.erc20_stETH_ABI),
    aUSD_Oracle_ABI: fetch(CONTRACT_ABI.aUSD_Oracle_ABI),
  };

  const constants = {
    FIXED_LIQUIDATION_VALUE: "1.0",
    MAX_UINT_256:
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    // AAVE_API_BASE_URL: "https://aave-data-service-7a85eea3aebe.herokuapp.com",
  };

  switch (chainId) {
    case 11155111: // Sepolia testnet
      return {
        chainName: "Sepolia Testnet",
        nativeCurrency: ETH_TOKEN,
        nativeWrapCurrency: WETH_TOKEN,
        rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/demo",
        aUSDAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
        erc20_stETHAddress: "0xD322A49006FC828F9B5B37Ab215F99B4E5caB19C",
        aUSD_OracleAddress: "0xC7be5307ba715ce89b152f3Df0658295b3dbA8E2",
        ...abis,
        ...constants,
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

// 🟢
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

// App config 🟢
function getConfig(network) {
  const chainId = state.chainId;
  switch (network) {
    case "mainnet":
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

const config = getConfig(context.networkId);

// App states
State.init({
  imports: {},
  chainId: undefined, // chainId is undefined in the case of unsupported chains
  isChainSupported: true,
  showDropdown: false,
  showWithdrawModal: false,
  showSupplyModal: false,
  showRepayModal: false,
  showBorrowModal: false,
  walletConnected: false,
  assetsToSupply: undefined,
  yourSupplies: undefined,
  assetsToBorrow: undefined,
  yourBorrows: undefined,
  address: undefined,
  baseAssetBalance: undefined,
  selectTab: "deposit", // deposit | withdraw | mint | repay
  totalDeposits: "1700",
  stablecoinApy: "8.33",
  healthFactor: "1.5",
});

const loading = !state.walletConnected;

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

function checkProvider() {
  const provider = Ethers.provider();
  if (provider) {
    State.update({ walletConnected: true });
  } else {
    State.update({ walletConnected: false });
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

function batchBalanceOf(chainId, userAddress, tokenAddresses, abi) {
  const balanceProvider = new ethers.Contract(
    config.balanceProviderAddress,
    abi.body,
    Ethers.provider().getSigner()
  );

  return balanceProvider.batchBalanceOf([userAddress], tokenAddresses);
}

// update data in async manner
function updateData(refresh) {
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
  provider
    .getSigner()
    ?.getAddress()
    ?.then((address) => {
      State.update({ address });
    });
  provider
    .getSigner()
    ?.getBalance()
    .then((balance) => State.update({ baseAssetBalance: balance }));
  if (!state.address || !state.baseAssetBalance) {
    return;
  }
}

function onActionSuccess({ msg, callback }) {
  // update data if action finishes
  updateData(true);
  // update UI after data has almost loaded
  setTimeout(() => {
    if (callback) {
      callback();
    }
    if (msg) {
      State.update({ alertModalText: msg });
    }
  }, 5000);
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

checkProvider();
if (state.walletConnected && state.chainId) {
  updateData();
}

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
          {state.walletConnected ? (
            <div> Deposit stETH</div>
          ) : (
            "Need to connect wallet first."
          )}
        </>
      )}
      {state.selectTab === "withdraw" && (
        <>
          {/* Add prebuilt component to replace 🟡 */}
          {state.walletConnected ? (
            <div> Withdraw stETH</div>
          ) : (
            "Need to connect wallet first."
          )}
        </>
      )}
      {state.selectTab === "mint" && (
        <>
          {/* Add prebuilt component to replace 🟡 */}
          {state.walletConnected ? (
            <div> Deposit stETH</div>
          ) : (
            "Need to connect wallet first."
          )}
        </>
      )}
      {state.selectTab === "repay" && (
        <>
          {/* Add prebuilt component to replace 🟡 */}
          {state.walletConnected ? (
            <div> Deposit stETH</div>
          ) : (
            "Need to connect wallet first."
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
