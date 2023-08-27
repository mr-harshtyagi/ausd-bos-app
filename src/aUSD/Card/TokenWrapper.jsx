const TokenWrapper = styled.div`
  display: flex;

  img {
    margin-right: 10px;
  }

  .token-title {
    font-size: 24px;
    font-weight: bold;
  }

  .token-chain {
    font-size: 16px;
    font-weight: 500;
    color: #6f6f6f;
  }

  @media (min-width: 640px) {
    img {
      width: 48px;
      height: 48px;
    }
    .token-title {
      font-size: 20px;
      font-weight: bold;
    }
  }
`;

return <TokenWrapper>{props.children}</TokenWrapper>;

{
  /* <img
width={64}
height={64}
src={`https://app.aave.com/icons/tokens/${"BAL".toLowerCase()}.svg`}
/>
<div>
<div className="token-title">{"BAL"}</div>
<div className="token-chain">{"Balancer"}</div>
</div> */
}

//children is rendering an array.