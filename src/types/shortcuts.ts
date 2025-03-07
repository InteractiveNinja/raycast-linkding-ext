import { Keyboard } from "@raycast/api";

enum KeyModifier {
  CMD = "cmd",
  CTRL = "ctrl",
  OPT = "opt",
  SHIFT = "shift",
}

enum Key {
  A = "a",
  B = "b",
  C = "c",
  D = "d",
  E = "e",
  F = "f",
  G = "g",
  H = "h",
  I = "i",
  J = "j",
  K = "k",
  L = "l",
  M = "m",
  N = "n",
  O = "o",
  P = "p",
  Q = "q",
  R = "r",
  S = "s",
  T = "t",
  U = "u",
  V = "v",
  W = "w",
  X = "x",
  Y = "y",
  Z = "z",
  ZERO = "0",
  ONE = "1",
  TWO = "2",
  THREE = "3",
  FOUR = "4",
  FIVE = "5",
  SIX = "6",
  SEVEN = "7",
  EIGHT = "8",
  NINE = "9",
  DOT = ".",
  COMMA = ",",
  SEMICOLON = ";",
  EQUALS = "=",
  PLUS = "+",
  MINUS = "-",
  LEFT_BRACKET = "[",
  RIGHT_BRACKET = "]",
  LEFT_CURLY_BRACKET = "{",
  RIGHT_CURLY_BRACKET = "}",
  LEFT_GUILLEMETS = "«",
  RIGHT_GUILLEMETS = "»",
  LEFT_ROUND_BRACKET = "(",
  RIGHT_ROUND_BRACKET = ")",
  SLASH = "/",
  BACKWARDS_SLASH = "\\",
  UPTICK = "'",
  BACKTICK = "`",
  PARAGRAPH = "§",
  CARRET = "^",
  AT = "@",
  DOLLAR = "$",
  RETURN = "return",
  DELETE = "delete",
  DELETE_FORWARD = "deleteForward",
  TAB = "tab",
  ARROW_UP = "arrowUp",
  ARROW_DOWN = "arrowDown",
  ARROW_LEFT = "arrowLeft",
  ARROW_RIGHT = "arrowRight",
  PAGEUP = "pageUp",
  PAGEDOWN = "pageDown",
  HOME = "home",
  END = "end",
  SPACE = "space",
  ESCAPE = "escape",
  ENTER = "enter",
  BACKSPACE = "backspace",
}

const COPY_SHORTCUT: Keyboard.Shortcut = {
  modifiers: [KeyModifier.CMD],
  key: Key.C,
};

const EDIT_SHORTCUT: Keyboard.Shortcut = {
  modifiers: [KeyModifier.CMD],
  key: Key.E,
};

const DELETE_SHORTCUT: Keyboard.Shortcut = {
  modifiers: [KeyModifier.CMD, KeyModifier.SHIFT],
  key: Key.BACKSPACE,
};

const VIEW_IN_LINKDING_SHORTCUT: Keyboard.Shortcut = {
  modifiers: [KeyModifier.CMD, KeyModifier.SHIFT],
  key: Key.RETURN,
};

const EDIT_IN_LINKDING_SHORTCUT: Keyboard.Shortcut = {
  modifiers: [KeyModifier.CMD, KeyModifier.SHIFT],
  key: Key.E,
};

const CREATE_TAG_SHORTCUT: Keyboard.Shortcut = {
  modifiers: [KeyModifier.CMD],
  key: Key.T,
};

export const LinkdingShortcut = {
  COPY_SHORTCUT,
  EDIT_SHORTCUT,
  DELETE_SHORTCUT,
  VIEW_IN_LINKDING_SHORTCUT,
  EDIT_IN_LINKDING_SHORTCUT,
  CREATE_TAG_SHORTCUT,
} as const;
