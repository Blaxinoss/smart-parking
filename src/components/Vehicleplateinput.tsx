/**
 * VehiclePlateInput.tsx
 *
 * Three individual letter boxes + one digit box.
 * Normalization happens here before the value is surfaced to the parent form,
 * so the DB always receives the canonical Arabic format: "ر و ص ١٢٣"
 */

import React, { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

// ─── normalizer (mirrors plateNormalizer.ts, kept inline for the component) ───

const WESTERN_TO_ARABIC: Record<string, string> = {
  "0": "٠",
  "1": "١",
  "2": "٢",
  "3": "٣",
  "4": "٤",
  "5": "٥",
  "6": "٦",
  "7": "٧",
  "8": "٨",
  "9": "٩",
};
const ARABIC_DIGITS = new Set([
  "٠",
  "١",
  "٢",
  "٣",
  "٤",
  "٥",
  "٦",
  "٧",
  "٨",
  "٩",
]);
const ARABIC_LETTERS = new Set([
  "أ",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ي",
]);

function toArabicDigit(ch: string): string {
  return WESTERN_TO_ARABIC[ch] ?? ch;
}

function isArabicLetter(ch: string): boolean {
  return ARABIC_LETTERS.has(ch);
}

function isArabicDigit(ch: string): boolean {
  return ARABIC_DIGITS.has(ch);
}

/** Build canonical plate from parts */
function buildPlate(letters: string[], digits: string): string {
  const letterPart = letters.filter(Boolean).join(" ");
  const digitPart = digits
    .split("")
    .map(toArabicDigit)
    .filter(isArabicDigit)
    .join("");
  if (!letterPart || !digitPart) return "";
  return `${letterPart} ${digitPart}`;
}

// ─── Zod schema (export and use in your form validation) ──────────────────────

export const plateZodRegex =
  /^[أبتثجحخدذرزسشصضطظعغفقكلمنهوي](\s[أبتثجحخدذرزسشصضطظعغفقكلمنهوي]){1,2}\s[٠١٢٣٤٥٦٧٨٩]{3,4}$/u;

/*
  Usage in your Zod schema:
  import { plateZodRegex } from './VehiclePlateInput';

  const VehicleZod = z.object({
    plate: z.string().regex(plateZodRegex, 'يجب أن تكون اللوحة بالصيغة: ر و ص ١٢٣'),
    color: z.string().max(15),
  });
*/

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** Called with the canonical plate string whenever inputs change, or '' if incomplete */
  onChange: (canonicalPlate: string) => void;
  error?: string;
}

export function VehiclePlateInput({ onChange, error }: Props) {
  const [letters, setLetters] = useState(["", "", ""]);
  const [digits, setDigits] = useState("");

  const letterRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];
  const digitRef = useRef<TextInput>(null);

  function updateLetter(index: number, raw: string) {
    // keep only the last valid Arabic letter typed
    const valid = raw.split("").filter(isArabicLetter);
    const value = valid.length > 0 ? valid[valid.length - 1] : "";

    const next = [...letters];
    next[index] = value;
    setLetters(next);
    onChange(buildPlate(next, digits));

    // auto-advance
    if (value && index < 2) {
      letterRefs[index + 1].current?.focus();
    } else if (value && index === 2) {
      digitRef.current?.focus();
    }
  }

  function updateDigits(raw: string) {
    // convert Western → Arabic-Indic, keep only digit chars, cap at 4
    const converted = raw
      .split("")
      .map(toArabicDigit)
      .filter(isArabicDigit)
      .join("");
    const capped = converted.slice(0, 4);
    setDigits(capped);
    onChange(buildPlate(letters, capped));
  }

  return (
    <View>
      <Text style={styles.label}>رقم اللوحة</Text>
      <View style={styles.row}>
        {/* Letters — right to left on screen to match plate appearance */}
        {[2, 1, 0].map((i) => (
          <TextInput
            key={i}
            ref={letterRefs[i]}
            style={[styles.letterBox, error ? styles.errorBorder : undefined]}
            value={letters[i]}
            onChangeText={(t) => updateLetter(i, t)}
            maxLength={2}
            textAlign="center"
            placeholderTextColor="#aaa"
          />
        ))}

        <View style={styles.separator} />

        {/* Digits */}
        <TextInput
          ref={digitRef}
          style={[styles.digitBox, error ? styles.errorBorder : undefined]}
          value={digits}
          onChangeText={updateDigits}
          maxLength={4}
          keyboardType="numeric"
          textAlign="center"
          placeholderTextColor="#aaa"
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: "right",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  letterBox: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "white",

    borderRadius: 8,
    fontSize: 20,
    textAlign: "center",
  },
  digitBox: {
    width: 96,
    height: 52,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "white",
    borderRadius: 8,
    fontSize: 20,
    textAlign: "center",
  },
  separator: {
    width: 1,
    height: 36,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  errorBorder: {
    borderColor: "#e24b4a",
  },
  errorText: {
    color: "#e24b4a",
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
});
