# PulseBoard Instructions

## Purpose

PulseBoard helps you monitor external APIs and understand:

- whether an endpoint is healthy
- how fast it responds
- when it failed
- when it recovered

## Core workflow

### 1. Create an account and sign in

- Open the login screen.
- Create an account with email and password.
- Sign in to enter your workspace.

### 2. Add a monitor

Use the `Add Monitor` button on the dashboard and complete:

- `Service Name`: a label like `Auth API`
- `URL`: the endpoint you want to monitor
- `HTTP Method`: usually `GET`
- `Expected Status`: usually `200`
- `Check Interval`: how often the monitor should be checked
- `Optional Headers`: JSON headers if the endpoint requires them

Example:

```json
{
  "Authorization": "Bearer demo-token"
}
```

## Dashboard overview

The dashboard shows:

- `Overall Health`: combined workspace status
- `Active Monitors`: how many monitors are enabled
- `Incidents Today`: how many failures were detected today
- `Avg Response Time`: average recent latency

Each endpoint card shows:

- service name
- current health status
- response time
- expected status code
- check interval
- whether the monitor is active or paused

## Running checks

Use:

- `Run All Checks` to test every active monitor
- `Run` on a single card to test one endpoint

Each check stores:

- status
- status code
- response time in milliseconds
- error message
- timestamp

## Status meanings

- `Healthy`: endpoint returned the expected status and responded normally
- `Degraded`: endpoint returned the expected status but was slow
- `Down`: endpoint failed, timed out, or returned the wrong status
- `Unknown`: no check has been run yet

## Monitor actions

From a monitor card you can:

- `Run`: perform an immediate check
- `Edit`: update monitor settings
- `Pause` or `Resume`: disable or enable checking
- `Delete`: remove the monitor
- `Details`: open historical data for that endpoint

## Details page

The details page shows:

- current status
- latest response time
- method and expected status
- response-time chart
- recent check history
- recent errors

Use this page when you need to diagnose a slow or failing endpoint.

## Incidents

An incident is created when a monitor transitions into failure.

Incidents help you answer:

- when an outage started
- whether it is still open
- when it recovered
- what error or failure reason was recorded

Use the `Incidents` page to review outages across the workspace.

## Recommended first run

For a new workspace:

1. Add one demo endpoint.
2. Run a single check.
3. Confirm the status card updates.
4. Open the details page and review history.
5. Add a failing test endpoint to confirm incidents work.

## Suggested test endpoints

For development you can use:

- `https://httpbin.org/status/200`
- `https://httpbin.org/status/500`
- `https://httpbin.org/delay/1`

## Notes

- If a monitor shows `Unknown`, no check has been run yet.
- If a check fails immediately, verify the URL, headers, and expected status.
- If a service should not be monitored temporarily, pause it instead of deleting it.
