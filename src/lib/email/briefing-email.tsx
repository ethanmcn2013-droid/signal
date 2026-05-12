import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { BriefItem, Briefing, FocusItem } from "@/lib/briefing/types";

const ink = "#14151a";
const inkSoft = "#535560";
const inkQuiet = "#7a7d87";
const brand = "#7c5cff";
const lineSoft = "#e7e7ec";
const sunken = "#f6f6f8";

const fontStack =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/**
 * The email render of the briefing. Voice + structure match
 * <BriefingView/> but the layout is email-safe: inline styles,
 * no Tailwind, no CSS vars, no motion. Why-this expansions are
 * deliberately not rendered here — locked v1 contract.
 */
export function BriefingEmail({
  briefing,
  unsubscribeUrl,
  preferencesUrl,
  viewInBrowserUrl,
  cadence,
}: {
  briefing: Briefing;
  unsubscribeUrl: string;
  preferencesUrl: string;
  viewInBrowserUrl: string;
  cadence: "daily" | "weekly";
}) {
  const preview = previewText(briefing);
  const dateLine = new Date(briefing.generatedAt).toLocaleDateString(
    "en-IE",
    {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: "#fafafb",
          margin: 0,
          padding: "32px 0",
          fontFamily: fontStack,
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: "0 auto",
            backgroundColor: "#ffffff",
            border: `1px solid ${lineSoft}`,
            borderRadius: 12,
            padding: "32px 28px",
          }}
        >
          {/* Stamp */}
          <Text
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: inkQuiet,
              margin: 0,
              marginBottom: 4,
            }}
          >
            {cadence === "weekly" ? "Weekly Signal" : "Daily Signal"} · {dateLine}
          </Text>

          {/* Greeting */}
          <Heading
            as="h1"
            style={{
              fontSize: 28,
              lineHeight: 1.2,
              fontWeight: 600,
              color: ink,
              margin: 0,
              marginBottom: 28,
            }}
          >
            {greeting(briefing.greetingHour)}
          </Heading>

          {briefing.needsAttention.length > 0 && (
            <Bucket title="Needs attention" items={briefing.needsAttention} />
          )}
          {briefing.movingWell.length > 0 && (
            <Bucket title="Moving well" items={briefing.movingWell} muted />
          )}
          {briefing.quietRisks.length > 0 && (
            <Bucket title="Quiet risks" items={briefing.quietRisks} />
          )}
          {briefing.suggestedFocus.length > 0 && (
            <FocusBlock items={briefing.suggestedFocus} />
          )}

          <Hr
            style={{ borderColor: lineSoft, margin: "32px 0 20px" }}
          />

          <Text
            style={{
              fontSize: 11.5,
              color: inkQuiet,
              margin: 0,
              marginBottom: 8,
            }}
          >
            Three items per block. Hard cap. The signal, not the noise.
          </Text>

          {/* Footer — opt-out and preferences */}
          <Text
            style={{
              fontSize: 12,
              color: inkSoft,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            <Link href={unsubscribeUrl} style={{ color: inkSoft }}>
              Stop these emails
            </Link>
            {"  ·  "}
            <Link href={preferencesUrl} style={{ color: inkSoft }}>
              Send {cadence === "daily" ? "weekly" : "daily"} instead
            </Link>
            {"  ·  "}
            <Link href={viewInBrowserUrl} style={{ color: inkSoft }}>
              View in browser
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function Bucket({
  title,
  items,
  muted,
}: {
  title: string;
  items: BriefItem[];
  muted?: boolean;
}) {
  return (
    <Section style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: muted ? inkSoft : ink,
          margin: 0,
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      {items.map((item) => (
        <Section
          key={item.id}
          style={{ marginBottom: 14 }}
        >
          <Text
            style={{
              fontSize: 15.5,
              lineHeight: 1.5,
              color: ink,
              margin: 0,
            }}
          >
            {item.text}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: inkQuiet,
              margin: 0,
              marginTop: 2,
            }}
          >
            from {item.sourceLabel}
          </Text>
        </Section>
      ))}
    </Section>
  );
}

function FocusBlock({ items }: { items: FocusItem[] }) {
  return (
    <Section
      style={{
        marginTop: 24,
        padding: "20px 18px",
        borderRadius: 10,
        border: `1px solid ${brand}26`,
        backgroundColor: `${brand}0a`,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: ink,
          margin: 0,
          marginBottom: 12,
        }}
      >
        Suggested focus
      </Text>
      {items.map((item) => (
        <Section
          key={item.id}
          style={{ marginBottom: 10 }}
        >
          <table
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            style={{ borderCollapse: "collapse" }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    fontSize: 15,
                    lineHeight: 1.45,
                    color: ink,
                    paddingRight: 12,
                  }}
                >
                  {item.text}
                </td>
                <td
                  align="right"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: inkQuiet,
                    whiteSpace: "nowrap",
                    verticalAlign: "baseline",
                  }}
                >
                  {item.due}
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      ))}
    </Section>
  );
}

function greeting(hour: number): string {
  if (hour < 5) return "It's late.";
  if (hour < 12) return "Good morning.";
  if (hour < 17) return "Good afternoon.";
  return "Good evening.";
}

function previewText(b: Briefing): string {
  // First line shown by Gmail/Apple Mail in the inbox list view.
  // Critical real estate. Lead with the most attention-worthy item.
  const first = b.needsAttention[0] ?? b.quietRisks[0] ?? b.suggestedFocus[0];
  if (!first) return "Nothing to flag today.";
  return "text" in first
    ? first.text
    : (first as FocusItem).text;
}
