const { config, select, setSelect } = props;

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

return (
  <TabContainer>
    <TabItem
      selected={select === "deposit"}
      onClick={() => setSelect("deposit")}
    >
      Deposit
    </TabItem>
    <TabItem selected={select === "mint"} onClick={() => setSelect("mint")}>
      Mint aUSD
    </TabItem>
    <TabItem selected={select === "repay"} onClick={() => setSelect("repay")}>
      Repay
    </TabItem>
  </TabContainer>
);

// Props: {
//     "config": {
//     "ipfsPrefix": "https://ipfs.near.social/ipfs",
//     "chainName": "Sepolia Testnet"
// },
// "select": "deposit",
// "setSelect": () => {},
// }
