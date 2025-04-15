# TradingView Integration

    ## Overview

    - **Version**: Free (Basic) version of TradingView.
    - **Component**: `AdvancedChart` widget.
    - **Purpose**: Displays 1-minute candlesticks for token price history, updated in real-time via WebSocket.

    ## Limitations

    - **Indicators**: Maximum of 2 indicators per chart. Using only candlestick data (open, close, high, low, volume).
    - **Charts per Tab**: 1 chart per tab.
    - **Real-Time Data**: No real-time data without delays in the free version, mitigated by BlitzHub's WebSocket updates.
    - **Ads**: Free version displays ads, impacting user experience but not functionality.

    ## Configuration

    - **Datafeed**:
      - `onReady`: Supports resolutions (1m, 5m, 15m, 60m).
      - `getBars`: Fetches historical data from `/api/token/{contractAddress}/price-history`.
      - `subscribeBars`: Subscribes to real-time updates via WebSocket.
