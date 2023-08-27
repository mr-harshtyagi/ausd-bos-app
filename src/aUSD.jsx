// main aUSD BOS app component

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

// Get AUSD network config by chain id 🟢
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
      return {
        chainName: "Polygon zkEVM Testnet",
        nativeCurrency: ETH_TOKEN,
        nativeWrapCurrency: WETH_TOKEN,
        rpcUrl: "https://rpc.public.zkevm-test.net",
        aavePoolV3Address: "0x4412c92f6579D9FC542D108382c8D1d6D2Be63d9",
        wrappedTokenGatewayV3Address:
          "0xD82940E16D25aB1349914e1C369eF1b287d457BF",
        balanceProviderAddress: "0x0da6DCAd2bE4801b644AEE679e0AdE008bB4bc6b",
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

function getGasPrice() {
  return Ethers.provider().getGasPrice();
}

function gasEstimation(action) {
  const assetsToSupply = state.assetsToSupply;
  if (!assetsToSupply) {
    return "-";
  }
  const baseAsset = assetsToSupply.find(
    (asset) => asset.symbol === config.nativeCurrency.symbol
  );
  if (!baseAsset) {
    return "-";
  }
  const { marketReferencePriceInUsd, decimals } = baseAsset;
  return getGasPrice().then((gasPrice) => {
    const gasLimit = GAS_LIMIT_RECOMMENDATIONS[action].limit;
    return Big(gasPrice.toString())
      .mul(gasLimit)
      .div(Big(10).pow(decimals))
      .mul(marketReferencePriceInUsd)
      .toFixed(2);
  });
}

function depositETHGas() {
  return gasEstimation("deposit");
}

function depositERC20Gas() {
  return gasEstimation("supplyWithPermit");
}

function withdrawETHGas() {
  return gasEstimation("withdrawETH");
}

function withdrawERC20Gas() {
  return gasEstimation("withdraw");
}

function borrowETHGas() {
  return gasEstimation("borrowETH");
}

function borrowERC20Gas() {
  return gasEstimation("borrow");
}

function repayETHGas() {
  return gasEstimation("repay");
}

function repayERC20Gas() {
  return gasEstimation("repayWithPermit");
}

// interface Market {
//   id: string,
//   underlyingAsset: string,
//   name: string,
//   symbol: string,
//   decimals: number,
//   supplyAPY: string;
//   marketReferencePriceInUsd: string;
//   usageAsCollateralEnabled: boolean;
//   aTokenAddress: string;
//   variableBorrowAPY: string;
// }
// returns Market[]
// function getMarkets(chainId) {
//   return asyncFetch(`${config.AAVE_API_BASE_URL}/${chainId}/markets`);
// }

/**
 * @param {string} account user address
 * @param {string[]} tokens list of token addresses
 */
// interface TokenBalance {
//   token: string,
//   balance: string,
//   decimals: number,
// }
// returns TokenBalance[]
// function getUserBalances(chainId, account, tokens) {
//   const url = `${
//     config.AAVE_API_BASE_URL
//   }/${chainId}/balances?account=${account}&tokens=${tokens.join("|")}`;
//   return asyncFetch(url);
// }

// interface UserDeposit {
//   underlyingAsset: string,
//   name: string,
//   symbol: string,
//   scaledATokenBalance: string,
//   usageAsCollateralEnabledOnUser: boolean,
//   underlyingBalance: string,
//   underlyingBalanceUSD: string,
// }
// returns UserDeposit[]
// function getUserDeposits(chainId, address) {
//   return asyncFetch(
//     `${config.AAVE_API_BASE_URL}/${chainId}/deposits/${address}`
//   );
// }

// App config
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
  selectTab: "supply", // supply | borrow
});

const loading =
  !state.assetsToSupply || !state.yourSupplies || !state.assetsToBorrow;

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
// Import functions
// const { formatAmount } = state.imports.number;
// const { formatDateTime } = state.imports.date;

function checkProvider() {
  const provider = Ethers.provider();
  if (provider) {
    State.update({ walletConnected: true });
  } else {
    State.update({ walletConnected: false });
  }
}

function calculateAvailableBorrows({
  availableBorrowsUSD,
  marketReferencePriceInUsd,
}) {
  return isValid(availableBorrowsUSD) && isValid(marketReferencePriceInUsd)
    ? Big(availableBorrowsUSD).div(marketReferencePriceInUsd).toFixed()
    : Number(0).toFixed();
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

  getMarkets(state.chainId).then((marketsResponse) => {
    if (!marketsResponse) {
      return;
    }
    const markets = marketsResponse.body;
    const marketsMapping = markets.reduce((prev, cur) => {
      prev[cur.underlyingAsset] = cur;
      return prev;
    }, {});

    const nativeMarket = markets.find(
      (market) => market.symbol === config.nativeWrapCurrency.symbol
    );
    markets.push({
      ...nativeMarket,
      ...{
        ...config.nativeCurrency,
        supportPermit: true,
      },
    });

    // get user balances
    batchBalanceOf(
      state.chainId,
      state.address,
      markets.map((market) => market.underlyingAsset),
      config.walletBalanceProviderABI
    )
      .then((balances) => balances.map((balance) => balance.toString()))
      .then((userBalances) => {
        const assetsToSupply = markets
          .map((market, idx) => {
            const balanceRaw = Big(
              market.symbol === config.nativeCurrency.symbol
                ? state.baseAssetBalance
                : userBalances[idx]
            ).div(Big(10).pow(market.decimals));
            const balance = balanceRaw.toFixed(market.decimals, ROUND_DOWN);
            const balanceInUSD = balanceRaw
              .mul(market.marketReferencePriceInUsd)
              .toFixed(3, ROUND_DOWN);
            return {
              ...market,
              balance,
              balanceInUSD,
            };
          })
          .sort((asset1, asset2) => {
            const balanceInUSD1 = Number(asset1.balanceInUSD);
            const balanceInUSD2 = Number(asset2.balanceInUSD);
            if (balanceInUSD1 !== balanceInUSD2)
              return balanceInUSD2 - balanceInUSD1;
            return asset1.symbol.localeCompare(asset2.symbol);
          });

        State.update({
          assetsToSupply,
        });
        // get user borrow data
        updateUserDebts(marketsMapping, assetsToSupply, refresh);
      });
    // get user supplies
    updateUserSupplies(marketsMapping, refresh);
  });
}

function updateUserSupplies(marketsMapping, refresh) {
  const prevYourSupplies = state.yourSupplies;
  getUserDeposits(state.chainId, state.address).then((userDepositsResponse) => {
    if (!userDepositsResponse) {
      return;
    }
    const userDeposits = userDepositsResponse.body.filter(
      (row) => Number(row.underlyingBalance) !== 0
    );
    const yourSupplies = userDeposits.map((userDeposit) => {
      const market = marketsMapping[userDeposit.underlyingAsset];
      return {
        ...market,
        ...userDeposit,
        ...(market.symbol === config.nativeWrapCurrency.symbol
          ? {
              ...config.nativeCurrency,
              supportPermit: true,
            }
          : {}),
      };
    });

    State.update({
      yourSupplies,
    });

    if (
      refresh &&
      JSON.stringify(prevYourSupplies) === JSON.stringify(yourSupplies) &&
      yourSupplies.length !== 0
    ) {
      console.log("refresh supplies again ...", prevYourSupplies, yourSupplies);
      setTimeout(updateData, 500);
    }
  });
}

function updateUserDebts(marketsMapping, assetsToSupply, refresh) {
  if (!marketsMapping || !assetsToSupply) {
    return;
  }

  const prevYourBorrows = state.yourBorrows;
  // userDebts depends on the balance from assetsToSupply
  const assetsToSupplyMap = assetsToSupply.reduce((prev, cur) => {
    if (cur.symbol !== config.nativeCurrency.symbol) {
      prev[cur.underlyingAsset] = cur;
    } else {
      prev[NATIVE_SYMBOL_ADDRESS_MAP_KEY] = cur;
    }
    return prev;
  }, {});

  getUserDebts(state.chainId, state.address).then((userDebtsResponse) => {
    if (!userDebtsResponse) {
      return;
    }
    const userDebts = userDebtsResponse.body;
    const assetsToBorrow = {
      ...userDebts,
      healthFactor: formatHealthFactor(userDebts.healthFactor),
      debts: userDebts.debts
        .map((userDebt) => {
          const market = marketsMapping[userDebt.underlyingAsset];
          if (!market) {
            return;
          }
          const { availableLiquidityUSD } = market;
          const availableBorrowsUSD = bigMin(
            userDebts.availableBorrowsUSD,
            availableLiquidityUSD
          )
            .times(ACTUAL_BORROW_AMOUNT_RATE)
            .toFixed();
          const assetsToSupplyMapKey =
            market.symbol === config.nativeWrapCurrency.symbol
              ? NATIVE_SYMBOL_ADDRESS_MAP_KEY
              : userDebt.underlyingAsset;
          return {
            ...market,
            ...userDebt,
            ...(market.symbol === config.nativeWrapCurrency.symbol
              ? {
                  ...config.nativeCurrency,
                  supportPermit: true,
                }
              : {}),
            availableBorrows: calculateAvailableBorrows({
              availableBorrowsUSD,
              marketReferencePriceInUsd: market.marketReferencePriceInUsd,
            }),
            availableBorrowsUSD,
            balance: assetsToSupplyMap[assetsToSupplyMapKey].balance,
            balanceInUSD: assetsToSupplyMap[assetsToSupplyMapKey].balanceInUSD,
          };
        })
        .filter((asset) => !!asset)
        .sort((asset1, asset2) => {
          const availableBorrowsUSD1 = Number(asset1.availableBorrowsUSD);
          const availableBorrowsUSD2 = Number(asset2.availableBorrowsUSD);
          if (availableBorrowsUSD1 !== availableBorrowsUSD2)
            return availableBorrowsUSD2 - availableBorrowsUSD1;
          return asset1.symbol.localeCompare(asset2.symbol);
        })
        .filter((asset) => {
          return asset.borrowingEnabled;
        }),
    };
    const yourBorrows = {
      ...assetsToBorrow,
      debts: assetsToBorrow.debts.filter(
        (row) =>
          !isNaN(Number(row.variableBorrowsUSD)) &&
          Number(row.variableBorrowsUSD) > 0
      ),
    };

    State.update({
      yourBorrows,
      assetsToBorrow,
    });

    if (
      refresh &&
      JSON.stringify(prevYourBorrows) === JSON.stringify(yourBorrows)
    ) {
      console.log("refresh borrows again ...", prevYourBorrows, yourBorrows);
      setTimeout(updateData, 500);
    }
  });
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

checkProvider();
if (state.walletConnected && state.chainId && loading) {
  updateData();
}

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
// Component body
const body = loading ? (
  <>
    <Widget src={`${config.ownerId}/widget/AAVE.Header`} props={{ config }} />
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
    <Widget src={`${config.ownerId}/widget/AAVE.Header`} props={{ config }} />
    <Body>
      <FlexContainer>
        <Widget
          src={`${config.ownerId}/widget/AAVE.NetworkSwitcher`}
          props={{
            chainId: state.chainId,
            config,
            switchNetwork: (chainId) => {
              switchEthereumChain(chainId);
            },
          }}
        />
        <Widget
          src={`${config.ownerId}/widget/AAVE.HeroData`}
          props={{
            config,
            netWorth: `$ ${
              state.assetsToBorrow?.netWorthUSD
                ? Big(state.assetsToBorrow.netWorthUSD).toFixed(2)
                : "-"
            }`,
            netApy: `${
              state.assetsToBorrow?.netAPY
                ? Number(
                    Big(state.assetsToBorrow.netAPY).times(100).toFixed(2)
                  ) === 0
                  ? "0.00"
                  : Big(state.assetsToBorrow.netAPY).times(100).toFixed(2)
                : "-"
            }%`,
            healthFactor: formatHealthFactor(state.assetsToBorrow.healthFactor),
            showHealthFactor:
              state.yourBorrows &&
              state.yourBorrows.debts &&
              state.yourBorrows.debts.length > 0,
          }}
        />
      </FlexContainer>
      <Widget
        src={`${config.ownerId}/widget/AAVE.TabSwitcher`}
        props={{
          config,
          select: state.selectTab,
          setSelect: (tabName) => State.update({ selectTab: tabName }),
        }}
      />
      {state.selectTab === "supply" && (
        <>
          <Widget
            src={`${config.ownerId}/widget/AAVE.Card.YourSupplies`}
            props={{
              config,
              chainId: state.chainId,
              yourSupplies: state.yourSupplies,
              showWithdrawModal: state.showWithdrawModal,
              setShowWithdrawModal: (isShow) =>
                State.update({ showWithdrawModal: isShow }),
              onActionSuccess,
              healthFactor: formatHealthFactor(
                state.assetsToBorrow.healthFactor
              ),
              formatHealthFactor,
              withdrawETHGas,
              withdrawERC20Gas,
            }}
          />
          <Widget
            src={`${config.ownerId}/widget/AAVE.Card.AssetsToSupply`}
            props={{
              config,
              chainId: state.chainId,
              assetsToSupply: state.assetsToSupply,
              showSupplyModal: state.showSupplyModal,
              setShowSupplyModal: (isShow) =>
                State.update({ showSupplyModal: isShow }),
              onActionSuccess,
              healthFactor: formatHealthFactor(
                state.assetsToBorrow.healthFactor
              ),
              formatHealthFactor,
              depositETHGas,
              depositERC20Gas,
            }}
          />
        </>
      )}
      {state.selectTab === "borrow" && (
        <>
          <Widget
            src={`${config.ownerId}/widget/AAVE.Card.YourBorrows`}
            props={{
              config,
              chainId: state.chainId,
              yourBorrows: state.yourBorrows,
              showRepayModal: state.showRepayModal,
              setShowRepayModal: (isShow) =>
                State.update({ showRepayModal: isShow }),
              showBorrowModal: state.showBorrowModal,
              setShowBorrowModal: (isShow) =>
                State.update({ showBorrowModal: isShow }),
              formatHealthFactor,
              onActionSuccess,
              repayETHGas,
              repayERC20Gas,
              borrowETHGas,
              borrowERC20Gas,
            }}
          />
          <Widget
            src={`${config.ownerId}/widget/AAVE.Card.AssetsToBorrow`}
            props={{
              config,
              chainId: state.chainId,
              assetsToBorrow: state.assetsToBorrow,
              showBorrowModal: state.showBorrowModal,
              yourSupplies: state.yourSupplies,
              setShowBorrowModal: (isShow) =>
                State.update({ showBorrowModal: isShow }),
              formatHealthFactor,
              onActionSuccess,
              borrowETHGas,
              borrowERC20Gas,
            }}
          />
        </>
      )}
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
