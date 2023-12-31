const {
  config,
  data,
  onActionSuccess,
  onRequestClose,
  chainId,
  title,
  loading,
} = props;

if (!data) {
  return <div />;
}

function isValid(a) {
  if (!a) return false;
  if (isNaN(Number(a))) return false;
  if (a === "") return false;
  return true;
}

const {
  symbol,
  balance,
  priceInUsd,
  decimals,
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
});

// 🟢
function depositStETH(amount) {
  State.update({
    loading: true,
  });
  return Ethers.provider()
    .getSigner()
    .getAddress()
    .then((address) => {
      const aUSDContract = new ethers.Contract(
        "contract_address",
        "abi_contract",
        Ethers.provider().getSigner()
      );
      return aUSDContract.depositStETH("param1", "param2", "param3", {
        value: amount,
      });
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
            console.log("tx failed", res);
            State.update({
              loading: false,
            });
          }
        })
        .catch(() => State.update({ loading: false }));
    })
    .catch(() => State.update({ loading: false }));
}

const maxValue = Big(balance).toFixed(3);

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
    const amountInUSD = Big(value).mul(priceInUsd).toFixed(2, ROUND_DOWN);
    State.update({
      amountInUSD,
      depositAmount: value,
    });
    updateNewHealthFactor();
  } else {
    State.update({
      amountInUSD: "0.00",
    });
  }
  State.update({ amount: value });
};

const PrimaryButton = styled.button`
  border: 0;

  color: white;
  background: ${loading || disabled ? "#36295C" : "#8247e5"};
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

return (
  <>
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
    <br />
    <PrimaryButton disabled={loading || disabled}>
      {loading ? <Loading /> : title}
    </PrimaryButton>
  </>
);

const props = {
  // coming from parent
  onActionSuccess: function onActionSuccess({ msg, callback }) {
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
  },
  chainId: "1111111",
  onRequestClose: () => console.log("onRequestClose"),
  data: {
    symbol: "BAL",
    balance: "2",
    priceInUsd: "2",
    decimals: 18,
  },
};
