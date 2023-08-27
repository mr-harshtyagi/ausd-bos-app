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
`;

const aUSDLogo = () => (
  <img
    height={25}
    src={`https://avatars.githubusercontent.com/u/77984392?v=4`}
  />
);

return (
  <Header>
    <aUSDLogo />
    <Web3Connect className="web3-connect" connectLabel="Connect Wallet" />
  </Header>
);

// No props needed