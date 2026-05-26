/**
 * Services & Hooks Example — How to use business logic utilities
 * Shows: API calls, localStorage, formatting, custom hooks
 * Learning: Service pattern, hook rules, data flow
 */
import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Heading,
  Text,
  Box,
  useLocalStorage,
  useFetch,
  api,
  storage,
  formatter,
  spacing,
} from "../index.js";

/**
 * Example 1: useLocalStorage hook
 * Syncs state with localStorage automatically
 */
export function LocalStorageExample() {
  const [theme, setTheme] = useLocalStorage("app-theme", "light");

  return (
    <Card title="localStorage Example" padding={spacing.lg}>
      <Text size="sm" style={{ marginBottom: spacing.md }}>
        Current theme: <strong>{theme}</strong> (check DevTools → Application → localStorage)
      </Text>
      <Box gap={spacing.md}>
        <Button
          variant={theme === "light" ? "primary" : "secondary"}
          onClick={() => setTheme("light")}
        >
          Light Theme
        </Button>
        <Button
          variant={theme === "dark" ? "primary" : "secondary"}
          onClick={() => setTheme("dark")}
        >
          Dark Theme
        </Button>
      </Box>
    </Card>
  );
}

/**
 * Example 2: useFetch hook
 * Fetches data with loading/error states
 */
export function FetchExample() {
  // Replace with real API endpoint
  const { data, loading, error } = useFetch("/api/users");

  return (
    <Card title="useFetch Example" padding={spacing.lg}>
      {loading && <Text size="sm">Loading...</Text>}
      {error && <Text size="sm" color="red">Error: {error.message}</Text>}
      {data && (
        <pre style={{ fontSize: "0.875rem", overflow: "auto" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </Card>
  );
}

/**
 * Example 3: API service (stateless utility)
 * Direct HTTP calls with error handling
 */
export function ApiExample() {
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    try {
      // Replace with real endpoint
      const result = await api.get("https://api.github.com/repos/facebook/react");
      setResponseText(`Stars: ${result.stargazers_count}`);
    } catch (err) {
      setResponseText(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="API Service Example" padding={spacing.lg}>
      <Text size="sm" style={{ marginBottom: spacing.md }}>
        Call an API endpoint and handle the response
      </Text>
      <Button onClick={handleFetch} disabled={loading}>
        {loading ? "Fetching..." : "Fetch React Repo Info"}
      </Button>
      {responseText && (
        <Text size="sm" style={{ marginTop: spacing.md }}>
          {responseText}
        </Text>
      )}
    </Card>
  );
}

/**
 * Example 4: Storage service (stateless utility)
 * Direct localStorage access without React state
 */
export function StorageExample() {
  const [message, setMessage] = useState("");

  const handleSave = () => {
    const data = { timestamp: new Date().toISOString(), text: "Saved!" };
    storage.set("example-data", data);
    setMessage("Saved to localStorage");
  };

  const handleLoad = () => {
    const data = storage.get("example-data", null);
    setMessage(data ? `Loaded: ${JSON.stringify(data)}` : "No data found");
  };

  const handleClear = () => {
    storage.remove("example-data");
    setMessage("Cleared!");
  };

  return (
    <Card title="Storage Service Example" padding={spacing.lg}>
      <Box gap={spacing.md} style={{ marginBottom: spacing.md }}>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="secondary" onClick={handleLoad}>
          Load
        </Button>
        <Button variant="ghost" onClick={handleClear}>
          Clear
        </Button>
      </Box>
      {message && (
        <Text size="sm" style={{ marginTop: spacing.md }}>
          {message}
        </Text>
      )}
    </Card>
  );
}

/**
 * Example 5: Formatter service (stateless utility)
 * Format dates, numbers, strings, etc.
 */
export function FormatterExample() {
  const now = new Date();
  const number = 1234.5678;
  const longText = "This is a very long piece of text that might need truncation";

  return (
    <Card title="Formatter Service Example" padding={spacing.lg}>
      <Box direction="column" gap={spacing.md}>
        <Box direction="column" gap="0.25rem">
          <Text size="sm" weight="600">
            Date Formatting:
          </Text>
          <Text size="xs">
            Short: {formatter.date(now, "short")}
          </Text>
          <Text size="xs">
            Long: {formatter.date(now, "long")}
          </Text>
          <Text size="xs">
            Time: {formatter.date(now, "time")}
          </Text>
        </Box>

        <Box direction="column" gap="0.25rem">
          <Text size="sm" weight="600">
            Number Formatting:
          </Text>
          <Text size="xs">
            Fixed (2 decimals): {formatter.number(number, 2)}
          </Text>
          <Text size="xs">
            Currency: {formatter.currency(number)}
          </Text>
          <Text size="xs">
            Bytes: {formatter.bytes(1024 * 1024)}
          </Text>
        </Box>

        <Box direction="column" gap="0.25rem">
          <Text size="sm" weight="600">
            String Formatting:
          </Text>
          <Text size="xs">
            Truncate: {formatter.truncate(longText, 30)}
          </Text>
          <Text size="xs">
            Capitalize: {formatter.capitalize("hello")}
          </Text>
          <Text size="xs">
            Slug: {formatter.slug("Hello World!")}
          </Text>
          <Text size="xs">
            Kebab: {formatter.kebab("helloWorld")}
          </Text>
        </Box>
      </Box>
    </Card>
  );
}

/**
 * Combined Example — All services in one component
 */
export default function ServicesExample() {
  return (
    <Box direction="column" gap={spacing.xl} padding={spacing.xl}>
      <Heading level={1}>Services & Hooks Examples</Heading>

      <Box
        direction="column"
        gap={spacing.lg}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        }}
      >
        <LocalStorageExample />
        <StorageExample />
        <ApiExample />
        <FormatterExample />
      </Box>

      <Box direction="column" gap={spacing.md}>
        <Heading level={3}>Notes:</Heading>
        <Text size="sm">
          • All services are stateless utilities (pure functions or simple objects)
        </Text>
        <Text size="sm">
          • Hooks manage local component state following React rules
        </Text>
        <Text size="sm">
          • No global state — all communication via props and returns
        </Text>
        <Text size="sm">
          • Easy to test, compose, and swap implementations
        </Text>
      </Box>
    </Box>
  );
}
