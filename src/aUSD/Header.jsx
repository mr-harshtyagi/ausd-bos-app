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
  .logo{
    color: white;
    scale :7;
    margin-left : 42px
  }
`;

const AUSDLogo = () => (
  <img
    height={25}
    className="logo"
    src={`https://raw.githubusercontent.com/mr-harshtyagi/ausd-bos-app/1657682b919b92878e17f35a62a787590da08258/src/Images/aUSD-LOGO.svg`}
  />
);

return (
  <Header>
    <AUSDLogo />
    <Web3Connect className="web3-connect" connectLabel="Connect Wallet" />
  </Header>
);

// No props needed