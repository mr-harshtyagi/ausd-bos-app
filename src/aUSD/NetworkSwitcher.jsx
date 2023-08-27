const { config, chainId, switchNetwork, disabled } = props;

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

const toggleDropdown = disabled
  ? () => {}
  : () => State.update({ showDropdown: !state.showDropdown });

const getChainImage = (chainId) => {
  switch (chainId) {
    case 11155111:
      return SepoliEthImage;
    default:
      throw new Error("unknown chain id");
  }
};

const ChainImage = getChainImage(chainId);

State.init({
  showDropdown: false,
});

return (
  <SwitchContainer>
    {state.showDropdown && (
      <DropdownMobile>
        <div>Select aUSD Market</div>
        <div
          className="dropdown-mobile-item"
          onClick={() => {
            State.update({ showDropdown: false });
            switchNetwork(11155111);
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
            switchNetwork(11155111);
          }}
        >
          <SepoliEthImage />
          <div>Sepolia Testnet</div>
        </div>
        
       
      </div>
    )}
  </SwitchContainer>
);

// Test Props
// {
//   "chainId": 11155111,
//   "ownerId": "aave-v3.near",
//   "config": {
//     "ipfsPrefix": "https://ipfs.near.social/ipfs",
//     "chainName": "Sepolia Testnet"
//   }
// }