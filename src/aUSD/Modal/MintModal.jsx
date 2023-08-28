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

State.init({
  stEthBalance: "2",
  stEthPriceInUsd: "1700",
  depositAmount: "",
  depositAmountInUSD: "0.00",
  depositButtonLoading: false,
});

// 🟢
function depositStETH(amount) {
  State.update({
    depositButtonLoading: true,
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
                .toFixed(8)} ${"stETH"}`,
              callback: () => {
                onRequestClose();
                State.update({
                  depositButtonLoading: false,
                });
              },
            });
            console.log("tx succeeded", res);
          } else {
            console.log("tx failed", res);
            State.update({
              depositButtonLoading: false,
            });
          }
        })
        .catch(() => State.update({ depositButtonLoading: false }));
    })
    .catch(() => State.update({ depositButtonLoading: false }));
}

const deposiMaxValue = Big(state.stEthBalance).toFixed(3);

const depositButtonDisabled =
  !state.depositAmount ||
  !isValid(state.depositAmount) ||
  Number(state.depositAmount) === 0;

const changeDepositValue = (value) => {
  if (Number(value) > Number(deposiMaxValue)) {
    value = deposiMaxValue;
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

const PrimaryButton = styled.button`
  border: 0;

  color: white;
  background: ${state.depositButtonLoading || depositButtonDisabled
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

const FlexBetweenContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DepositTitle = styled.div`
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

return (
  <>
    <DepositTitle>Amount to Deposit</DepositTitle>
    <Content>
      {" "}
      <>
        <FlexBetweenContainer>
          <TokenTexture>
            <Input
              type="number"
              value={state.depositAmount}
              onChange={(e) => {
                changeValue(e.target.value);
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
                changeDepositValue(maxValue);
              }}
            >
              MAX
            </Max>
          </GrayTexture>
        </FlexBetweenContainer>
      </>
    </Content>
    <br />
    <PrimaryButton
      onClick={depositStETH}
      disabled={depositButtonLoading || depositButtonDisabled}
    >
      {depositButtonLoading ? <Loading /> : "Deposit"}
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
