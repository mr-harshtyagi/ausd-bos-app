const DataWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .card-data-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .card-data-key {
    color: #777790;
    font-size: 15px;
    font-weight: 500;
  }
  .card-data-value {
    font-size: 15px;
    font-weight: bold;
    text-align: right;
  }
`;

return <DataWrapper>{props.children}</DataWrapper>;

// src={`${config.ownerId}/widget/AAVE.Card.CardDataWrapper`}
// props={{
//   children: [
//     <div className="card-data-row">
//       <div className="card-data-key">
//         Wallet Balance
//       </div>
//       <div className="card-data-value">
//         <div>
//           {Number(row.balance).toFixed(7)}
//         </div>
//         <div>$ {row.balanceInUSD}</div>
//       </div>
//     </div>,
//     <div className="card-data-row">
//       <div className="card-data-key">
//         Supply APY
//       </div>
//       <div className="card-data-value">{`${(
//         Number(row.supplyAPY) * 100
//       ).toFixed(2)} %`}</div>
//     </div>,
//     <div className="card-data-row">
//       <div className="card-data-key">
//         Can be Collateral
//       </div>
//       <div className="card-data-value">
//         {row.isIsolated && "—"}
//         {!row.isIsolated && (
//           <>
//             {row.usageAsCollateralEnabled && (
//               <img
//                 src={`${config.ipfsPrefix}/bafkreibsy5fzn67veowyalveo6t34rnqvktmok2zutdsp4f5slem3grc3i`}
//                 width={16}
//                 height={16}
//               />
//             )}
//             {!row.usageAsCollateralEnabled && (
//               <img
//                 src={`${config.ipfsPrefix}/bafkreie5skej6q2tik3qa3yldkep4r465poq33ay55uzp2p6hty2ifhkmq`}
//                 width={16}
//                 height={16}
//               />
//             )}
//           </>
//         )}
//       </div>
//     </div>,
//   ],
// }}
