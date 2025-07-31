import Ethers from "./pages/ApproveEther";
import Listen from "./pages/ListenEther";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const App = () => {
  return (
    <div style={{ padding: "20px", width: "100%", height: "100vh" }}>
      <div style={{ marginBottom: "20px" }}>
        <Ethers />
      </div>
      <div>
        <Listen />
      </div>
    </div>
  );
};

export default App;
