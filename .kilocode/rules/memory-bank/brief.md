# Project Brief: OmegaFin Autonomous Intelligence System

## Purpose

OmegaFin is a comprehensive AI-powered investment company simulation system. It simulates a full investment company operating within a web interface, where 48 intelligent agents (8 main experts + 40 assistants) collaborate to analyze markets and make investment recommendations.

## Target Users

- Individual investors seeking AI-powered analysis
- Traders wanting multi-perspective market analysis
- Financial enthusiasts exploring AI-driven decision making

## Core Use Case

Users query the system about investment decisions (e.g., "Should I buy gold now?"). The system activates a virtual "war room" where all 48 expert agents analyze the question from different angles, debate, and produce a unified recommendation through weighted voting under CEO supervision.

## Key Requirements

### Must Have

- Modern Next.js 16 setup with App Router
- TypeScript for type safety
- Tailwind CSS 4 for styling with dark theme
- Arabic RTL interface
- 8 main expert agents with distinct roles
- 40 assistant agents with specialized functions
- War room consultation system
- Risk management with veto capability
- Self-learning engine with accuracy tracking
- Knowledge base for market patterns

### Nice to Have

- Ghost mode for paper trading
- Voice consultation interface
- Real-time market data integration
- Broker API connectivity
- Crisis detection system

## Success Metrics

- All 48 agents properly defined and functional
- War room produces coherent multi-perspective analysis
- Risk management enforces limits correctly
- Arabic interface renders correctly in RTL

## Constraints

- Simulation mode (no real trading)
- Next.js 16 + React 19 + Tailwind CSS 4
- Package manager: Bun
- No external API keys required for demo
