import Ethers from "./pages/ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const App = () => {
  return (
    <div>
      <Ethers />
    </div>
  );
};

export default App;
