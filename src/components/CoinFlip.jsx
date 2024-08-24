import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./CoinFlip.css";

const CoinFlip = () => {
  const [betAmount, setBetAmount] = useState("");
  const [isHeads, setIsHeads] = useState(true);
  const [message, setMessage] = useState("");
  const [flipping, setFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [account, setAccount] = useState(null);

  // Connect to the user's wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        updateWalletBalance(accounts[0]);
        setMessage("Wallet connected successfully!");
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        setMessage("Failed to connect to wallet.");
      }
    } else {
      setMessage("Please install Metamask.");
      console.log("Metamask not detected");
    }
  };

  // Update the wallet balance
  const updateWalletBalance = async (account) => {
    if (window.ethereum && account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(account);
      setWalletBalance(ethers.utils.formatEther(balance));
    }
  };

  // Handle coin flip logic
  const flipCoin = async () => {
    if (!betAmount || betAmount <=0) {
      setMessage("Please enter a valid bet amount.");
      return;
    }

    if (parseFloat(betAmount) > parseFloat(walletBalance)) {
      setMessage("Insufficient balance for this bet.");
      return;
    }

    setFlipping(true);
    setMessage("");
    setCoinResult(null);

    setTimeout(() => {
      const result = Math.random() < 0.5;
      const win = (isHeads && result) || (!isHeads && !result);

      setCoinResult(result ? "heads" : "tails");
      setFlipping(false);

      const newBalance = win
        ? parseFloat(walletBalance) + parseFloat(betAmount)
        : parseFloat(walletBalance) - parseFloat(betAmount);

      setWalletBalance(newBalance.toFixed(4));

      if (win) {
        setMessage(`🎉 You won! Your bet of ${betAmount} ETH has doubled.`);
      } else {
        setMessage(`😞 You lost! Your bet of ${betAmount} ETH is gone.`);
      }
    }, 2000); 
  };

  useEffect(() => {
    if (account) {
      updateWalletBalance(account);
    }
  }, [account]);

  return (
    <div className="coinflip-container">
      <h1>Coin Flip Game</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Wallet Address: {account}</p>
          <p>Balance: {walletBalance} ETH</p>
          <div className="bet-section">
            <label>Bet Amount (ETH):</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
            />
          </div>
          <div className="choice-section">
            <label>
              <input
                type="radio"
                name="side"
                checked={isHeads}
                onChange={() => setIsHeads(true)}
              />
              Heads
            </label>
            <label>
              <input
                type="radio"
                name="side"
                checked={!isHeads}
                onChange={() => setIsHeads(false)}
              />
              Tails
            </label>
          </div>
          <button onClick={flipCoin} disabled={flipping}>
            {flipping ? "Flipping..." : "Flip Coin"}
          </button>
          <div className="coin">
            {flipping ? (
              <div className="coin-animation"></div>
            ) : coinResult ? (
              <div className={`coin-result ${coinResult}`}></div>
            ) : null}
          </div>
          {message && <p className="message">{message}</p>}
        </>
      )}
    </div>
  );
};

export default CoinFlip;