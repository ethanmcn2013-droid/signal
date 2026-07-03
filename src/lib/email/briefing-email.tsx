import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { BriefItem, Briefing, FocusItem } from "@/lib/briefing/types";
import { ageNote, graceNote, greeting, summaryLine } from "@/lib/briefing/voice";

// ─────────────────────────────────────────────────────────────
// Brand tokens, kept inline because email clients don't have
// CSS variables. Mirrors the marketing site's design language.
// ─────────────────────────────────────────────────────────────
const ink = "#14151a";
const inkSoft = "#535560";
const inkQuiet = "#7a7d87";
const brand = "#4f46e5";
const accentAttention = "#c2410c"; // muted amber-orange
const accentMoving = "#2e7d57"; // muted green
const accentRisk = "#4f46e5"; // brand indigo (quiet risks share brand colour)
const lineSoft = "#ececf0";
const surface = "#ffffff";
const surfaceTint = "#fafafb";

const fontStack =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const monoStack =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

/**
 * The email render of the briefing. Voice + structure match
 * <BriefingView/> on the web, but the layout is email-safe:
 * inline styles, table-based focus block, no CSS variables,
 * no Tailwind, no motion. Why-this expansions stay on the web
 * by design (locked v1 contract).
 */
export function BriefingEmail({
  briefing,
  unsubscribeUrl,
  preferencesUrl,
  viewInBrowserUrl,
  cadence,
  firstName,
}: {
  briefing: Briefing;
  unsubscribeUrl: string;
  preferencesUrl: string;
  viewInBrowserUrl: string;
  cadence: "daily" | "weekly";
  firstName?: string | null;
}) {
  const preview = previewText(briefing);
  const dateOnly = new Date(briefing.generatedAt)
    .toLocaleDateString("en-IE", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();
  // Lead the date line with the cadence so the body alone tells the
  // reader which kind of brief this is (the subject line does it too,
  // but a glance at the body should confirm without backtracking).
  const cadenceLabel = cadence === "weekly" ? "Weekly Signal" : "Daily Signal";
  const dateLine = `${cadenceLabel.toUpperCase()} · ${dateOnly}`;
  const summary = summaryLine(briefing);

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: surfaceTint,
          margin: 0,
          padding: "40px 0",
          fontFamily: fontStack,
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: "0 auto",
            backgroundColor: surface,
            border: `1px solid ${lineSoft}`,
            borderRadius: 14,
            padding: 0,
            overflow: "hidden",
          }}
        >
          {/* Wordmark header, branded identity strip */}
          <Section
            style={{
              padding: "20px 28px 16px",
              borderBottom: `1px solid ${lineSoft}`,
              backgroundColor: surface,
            }}
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
                      fontSize: 14,
                      fontWeight: 600,
                      color: ink,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    signal studio.{" "}
                    <span
                      style={{
                        color: inkQuiet,
                        fontWeight: 500,
                      }}
                    >
                      / analytics
                    </span>
                  </td>
                  <td
                    align="right"
                    style={{
                      fontFamily: monoStack,
                      fontSize: 10.5,
                      letterSpacing: "0.16em",
                      color: inkQuiet,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {dateLine}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Body */}
          <Section style={{ padding: "28px 28px 24px" }}>
            {/* Greeting + one-line summary */}
            <Heading
              as="h1"
              style={{
                fontSize: 30,
                lineHeight: 1.15,
                fontWeight: 600,
                color: ink,
                margin: 0,
                marginBottom: 8,
                letterSpacing: "-0.015em",
              }}
            >
              {greeting(briefing.greetingHour, firstName, true)}
            </Heading>
            {summary ? (
              <Text
                style={{
                  fontSize: 15.5,
                  color: inkSoft,
                  margin: 0,
                  marginBottom: 28,
                  lineHeight: 1.5,
                }}
              >
                {summary}
              </Text>
            ) : null}

            {briefing.needsAttention.length > 0 && (
              <Bucket
                title="Needs attention"
                items={briefing.needsAttention}
                accent={accentAttention}
              />
            )}
            {briefing.movingWell.length > 0 && (
              <Bucket
                title="Moving well"
                items={briefing.movingWell}
                accent={accentMoving}
                muted
              />
            )}
            {briefing.quietRisks.length > 0 && (
              <Bucket
                title="Quiet risks"
                items={briefing.quietRisks}
                accent={accentRisk}
              />
            )}
            {briefing.suggestedFocus.length > 0 && (
              <FocusBlock items={briefing.suggestedFocus} />
            )}

            {/* Grace note */}
            <Text
              style={{
                fontSize: 13,
                color: inkQuiet,
                fontStyle: "italic",
                margin: 0,
                marginTop: 28,
              }}
            >
              {graceNote(briefing)}
            </Text>
          </Section>

          {/* Footer */}
          <Section
            style={{
              padding: "16px 28px 20px",
              borderTop: `1px solid ${lineSoft}`,
              backgroundColor: surfaceTint,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontFamily: monoStack,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: inkQuiet,
                margin: 0,
                marginBottom: 8,
              }}
            >
              Three per block. Hard cap.
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: inkSoft,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              <Link href={unsubscribeUrl} style={{ color: inkSoft, textDecoration: "underline" }}>
                Stop these emails
              </Link>
              {"   ·   "}
              <Link href={preferencesUrl} style={{ color: inkSoft, textDecoration: "underline" }}>
                {cadence === "daily" ? "Send weekly instead" : "Send daily instead"}
              </Link>
              {"   ·   "}
              <Link href={viewInBrowserUrl} style={{ color: inkSoft, textDecoration: "underline" }}>
                View in browser
              </Link>
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: inkQuiet,
                margin: 0,
                marginTop: 10,
              }}
            >
              Sent by signal studio., one short read per day, no marketing,
              no upsells.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function Bucket({
  title,
  items,
  accent,
  muted,
}: {
  title: string;
  items: BriefItem[];
  accent: string;
  muted?: boolean;
}) {
  return (
    <Section style={{ marginBottom: 22 }}>
      <table cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", marginBottom: 10 }}>
        <tbody>
          <tr>
            <td
              style={{
                width: 8,
                paddingRight: 8,
                verticalAlign: "middle",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: accent,
                }}
              />
            </td>
            <td
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: muted ? inkSoft : ink,
              }}
            >
              {title}
            </td>
          </tr>
        </tbody>
      </table>
      {items.map((item) => (
        <Section
          key={item.id}
          style={{
            marginBottom: 12,
            paddingLeft: 16,
            borderLeft: `2px solid ${muted ? lineSoft : accent}33`,
          }}
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
              fontSize: 11.5,
              fontFamily: monoStack,
              letterSpacing: "0.04em",
              color: inkQuiet,
              margin: 0,
              marginTop: 3,
            }}
          >
            from {item.sourceLabel}
            {item.ageDays ? ` · ${ageNote(item.trigger, item.ageDays)}` : null}
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
        marginTop: 28,
        padding: "20px 20px 16px",
        borderRadius: 12,
        border: `1px solid ${brand}26`,
        backgroundColor: `${brand}08`,
      }}
    >
      <table cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", marginBottom: 12 }}>
        <tbody>
          <tr>
            <td
              style={{
                width: 8,
                paddingRight: 8,
                verticalAlign: "middle",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: brand,
                }}
              />
            </td>
            <td
              style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: ink,
              }}
            >
              Suggested focus
            </td>
          </tr>
        </tbody>
      </table>
      {items.map((item) => (
        <Section
          key={item.id}
          style={{ marginBottom: 8 }}
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
                    fontSize: 10.5,
                    fontFamily: monoStack,
                    letterSpacing: "0.08em",
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

// greeting / summaryLine / graceNote moved to @/lib/briefing/voice
// (single source of truth across email/text/web).

function previewText(b: Briefing): string {
  // Inbox-snippet copy. Calmer than the subject, names the *shape*
  // of the day, not the alarming first item. Falls back to a quiet
  // line when summaryLine has nothing to say (quiet-but-not-empty
  // days, e.g. only moving-well items survived).
  if (b.isEmpty) return "Nothing to flag today.";
  return summaryLine(b) || "Nothing pulling today.";
}

