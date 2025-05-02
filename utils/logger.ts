const symbols = {
  success: {
    text: {
      symbol: `\x1b[32m ✓ \x1b[0m`,
      verbose: `\x1b[32m SUCCESS \x1b[0m`,
    },
    bg: {
      symbol: `\x1b[42m ✓ \x1b[0m`,
      verbose: `\x1b[42m SUCCESS \x1b[0m`,
    },
  },
  info: {
    text: {
      symbol: `\x1b[34m i \x1b[0m`,
      verbose: `\x1b[34m INFO \x1b[0m`,
    },
    bg: {
      symbol: `\x1b[44m i \x1b[0m`,
      verbose: `\x1b[44m INFO \x1b[0m`,
    },
  },
  warning: {
    text: {
      symbol: `\x1b[33m ! \x1b[0m`,
      verbose: `\x1b[33m WARNING \x1b[0m`,
    },
    bg: {
      symbol: `\x1b[43m ! \x1b[0m`,
      verbose: `\x1b[43m WARNING \x1b[0m`,
    },
  },
  error: {
    text: {
      symbol: `\x1b[31m X \x1b[0m`,
      verbose: `\x1b[31m ERROR \x1b[0m`,
    },
    bg: {
      symbol: `\x1b[41m X \x1b[0m`,
      verbose: `\x1b[41m ERROR \x1b[0m`,
    },
  },
};

class Logger {
  isVerbose: boolean;
  isBg: boolean;

  constructor() {
    this.isVerbose = false;
    this.isBg = false;
  }

  _getSymbol(symbolBase) {
    const colorVariant = this.isBg ? "bg" : "text";
    const symbolVariant = this.isVerbose ? "verbose" : "symbol";

    return symbolBase[colorVariant][symbolVariant];
  }

  bg() {
    this.isBg = true;
    return this;
  }

  verbose() {
    this.isVerbose = true;
    return this;
  }

  info(...message) {
    const symbol = this._getSymbol(symbols.info);
    console.log(symbol, ...message);
    this.reset();
  }

  success(...message) {
    const symbol = this._getSymbol(symbols.success);
    console.log(symbol, ...message);
    this.reset();
  }

  error(...message) {
    const symbol = this._getSymbol(symbols.error);
    console.log(symbol, ...message);
    this.reset();
  }

  warning(...message) {
    const symbol = this._getSymbol(symbols.warning);
    console.log(symbol, ...message);
    this.reset();
  }

  reset() {
    this.isVerbose = false;
    this.isBg = false;
  }
}

export default new Logger();
