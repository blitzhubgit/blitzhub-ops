const TokenChart = ({ contractAddress }) => {
      return (
        <AdvancedChart
          symbol="MOON"
          interval="1"
          datafeed={{
            onReady: (callback) => callback({ supported_resolutions: ["1", "5", "15", "60"] }),
            getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback) => {
              const response = await fetch(`/api/token/${contractAddress}/price-history?interval=1m`);
              const bars = await response.json();
              onHistoryCallback(bars, { noData: false });
            },
            subscribeBars: (symbolInfo, resolution, onRealtimeCallback) => {
              const ws = new WebSocket(`wss://eu-be.blitzhub.xyz/token/${contractAddress}/updates`);
              ws.onmessage = (event) => {
                const update = JSON.parse(event.data);
                onRealtimeCallback({
                  time: new Date().getTime(),
                  close: update.price,
                  volume: update.volume24h,
                });
              };
            },
          }}
        />
      );
    };
