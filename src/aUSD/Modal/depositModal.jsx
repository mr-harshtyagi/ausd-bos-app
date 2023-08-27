const {
  config,
  data,
  onRequestClose,
  onActionSuccess,
  chainId,
  depositERC20Gas,
  formatHealthFactor,
} = props;

if (!data) {
  return <div />;
}

const MIN_ETH_GAS_FEE = 0.001;
const ROUND_DOWN = 0;
function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}

const {
  symbol,
  balance,
  marketReferencePriceInUsd,
  supplyAPY,
  usageAsCollateralEnabled,
  decimals,
  underlyingAsset,
  name: tokenName,
  healthFactor,
  supportPermit,
} = data;

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

State.init({
  amount: "",
  amountInUSD: "0.00",
  loading: false,
  newHealthFactor: "-",
  gas: "-",
  allowanceAmount: "0",
  needApprove: false,
});

/**
 *
 * @param {string} user user address
 * @param {string} reserve AAVE reserve address (token to supply)
 * @param {string} amount token amount in full decimals
 * @param {number} deadline unix timestamp in SECONDS
 * @param {string} rawSig signature from signERC20Approval
 * @returns txn object 🟢🟢
 */

function update() {
  if (
    !isValid(state.amount) ||
    !isValid(state.allowanceAmount) ||
    Number(state.allowanceAmount) < Number(state.amount) ||
    Number(state.amount) === 0
  ) {
    State.update({ needApprove: true });
  } else {
    State.update({ needApprove: false });
  }
}

// update(); 🟢

// 🟢
function depositErc20(amount) {
  State.update({
    loading: true,
  });
  const deadline = Math.floor(Date.now() / 1000 + 3600); // after an hour

  Ethers.provider()
    .getSigner()
    .getAddress()
    .then((userAddress) => {
      if (!supportPermit) {
        depositFromApproval(amount)
          .then((tx) => {
            tx.wait()
              .then((res) => {
                const { status } = res;
                if (status === 1) {
                  onActionSuccess({
                    msg: `You supplied ${Big(amount)
                      .div(Big(10).pow(decimals))
                      .toFixed(8)} ${symbol}`,
                    callback: () => {
                      onRequestClose();
                      State.update({
                        loading: false,
                      });
                    },
                  });
                  console.log("tx succeeded", res);
                } else {
                  State.update({
                    loading: false,
                  });
                  console.log("tx failed", res);
                }
              })
              .catch(() => State.update({ loading: false }));
          })
          .catch(() => State.update({ loading: false }));
      } else {
        const token = underlyingAsset;
        signERC20Approval(userAddress, token, tokenName, amount, deadline)
          .then((rawSig) => {
            return supplyWithPermit(
              userAddress,
              token,
              amount,
              deadline,
              rawSig
            );
          })
          .then((tx) => {
            tx.wait()
              .then((res) => {
                const { status } = res;
                if (status === 1) {
                  onActionSuccess({
                    msg: `You supplied ${Big(amount)
                      .div(Big(10).pow(decimals))
                      .toFixed(8)} ${symbol}`,
                    callback: () => {
                      onRequestClose();
                      State.update({
                        loading: false,
                      });
                    },
                  });
                  console.log("tx succeeded", res);
                } else {
                  State.update({
                    loading: false,
                  });
                  console.log("tx failed", res);
                }
              })
              .catch(() => State.update({ loading: false }));
          })
          .catch(() => State.update({ loading: false }));
      }
    })
    .catch(() => State.update({ loading: false }));
}

const maxValue =
  symbol === config.nativeCurrency.symbol
    ? Big(balance).minus(MIN_ETH_GAS_FEE).toFixed(decimals)
    : Big(balance).toFixed(decimals);

function debounce(fn, wait) {
  let timer = state.timer;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
    }, wait);
    State.update({ timer });
  };
}

const disabled =
  !state.amount || !isValid(state.amount) || Number(state.amount) === 0;

const changeValue = (value) => {
  if (Number(value) > Number(maxValue)) {
    value = maxValue;
  }
  if (Number(value) < 0) {
    value = "0";
  }
  if (isValid(value)) {
    const amountInUSD = Big(value)
      .mul(marketReferencePriceInUsd)
      .toFixed(2, ROUND_DOWN);
    State.update({
      amountInUSD,
    });
    updateNewHealthFactor();
  } else {
    State.update({
      amountInUSD: "0.00",
      newHealthFactor: "-",
    });
  }
  State.update({ amount: value });
};

return (
  <>
    <Widget
      src={`${config.ownerId}/widget/AAVE.Modal.BaseModal`}
      props={{
        title: `Supply ${ETH}`,
        onRequestClose: onRequestClose,
        children: (
          <WithdrawContainer>
            <Widget
              src={`${config.ownerId}/widget/AAVE.Modal.RoundedCard`}
              props={{
                title: "Amount",
                config,
                children: (
                  <>
                    <Widget
                      src={`${config.ownerId}/widget/AAVE.Modal.FlexBetween`}
                      props={{
                        left: (
                          <TokenTexture>
                            <Input
                              type="number"
                              value={state.amount}
                              onChange={(e) => {
                                changeValue(e.target.value);
                              }}
                              placeholder="0"
                            />
                          </TokenTexture>
                        ),
                        right: (
                          <TokenWrapper>
                            <img
                              width={26}
                              height={26}
                              src={`https://app.aave.com/icons/tokens/${"BAL".toLowerCase()}.svg`}
                            />
                            <TokenTexture>{"BAL"}</TokenTexture>
                          </TokenWrapper>
                        ),
                      }}
                    />
                    <Widget
                      src={`${config.ownerId}/widget/AAVE.Modal.FlexBetween`}
                      props={{
                        left: <GrayTexture>${state.amountInUSD}</GrayTexture>,
                        right: (
                          <GrayTexture>
                            Wallet Balance:{" "}
                            {isValid(balance) && balance !== "-"
                              ? Big(balance).toFixed(7)
                              : balance}
                            <Max
                              onClick={() => {
                                changeValue(maxValue);
                              }}
                            >
                              MAX
                            </Max>
                          </GrayTexture>
                        ),
                      }}
                    />
                  </>
                ),
              }}
            />

            <Widget
              src={`${config.ownerId}/widget/AAVE.PrimaryButton`}
              props={{
                config,
                children: `Supply ${"BAL"}`,
                loading: state.loading,
                disabled,
                onClick: () => {
                  const amount = Big(state.amount)
                    .mul(Big(10).pow(decimals))
                    .toFixed(0);
                  if (symbol === config.nativeCurrency.symbol) {
                    // supply eth
                    depositETH(amount);
                  } else {
                    // supply common
                    depositErc20(amount);
                  }
                },
              }}
            />
          </WithdrawContainer>
        ),
        config,
      }}
    />
  </>
);
