#!/usr/bin/env bash
# Reproduce the lob-engine latency numbers on this machine and write one JSON file.
#
#   scripts/bench-lob-engine.sh                 # 5 runs, writes ./lob-bench-result.json
#   RUNS=7 PIN_CPU=2 OUT=mac.json scripts/bench-lob-engine.sh
#   METHOD=committed RUNS=3 scripts/bench-lob-engine.sh   # the benchmark exactly as committed (50 M ops, no warm-up)
#
# Needs: git, cmake, a C++17 compiler, python3. Works on Linux and macOS.
# The committed bench/benchmark.cpp runs 50 M operations with the warm-up commented out.
# This script applies the README's stated method on a scratch copy (5 M operations after a
# 100 K warm-up), adds max latency and a log-bucketed histogram, and leaves the repo untouched.
set -euo pipefail

RUNS="${RUNS:-5}"
METHOD="${METHOD:-readme}"
OUT="${OUT:-$PWD/lob-bench-result.json}"
REPO="${REPO:-https://github.com/Ahmed-Berrada/lob-engine.git}"
CXX_BIN="${CXX:-c++}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

for tool in git cmake python3 "$CXX_BIN"; do
  command -v "$tool" >/dev/null || { echo "missing tool: $tool" >&2; exit 1; }
done

git clone --quiet --depth 1 "$REPO" "$WORK/lob"
COMMIT="$(git -C "$WORK/lob" rev-parse --short HEAD)"

python3 - "$WORK/lob/bench/benchmark.cpp" "$METHOD" <<'PY'
import sys
p = sys.argv[1]
method = sys.argv[2]
s = open(p).read()

def swap(old, new):
    global s
    if old not in s:
        sys.exit("bench/benchmark.cpp changed upstream; update this script (missing: %r)" % old[:50])
    s = s.replace(old, new, 1)

swap("#include <iomanip>", "#include <iomanip>\n#include <fstream>\n#include <cstdlib>\n#include <cmath>\n#include <map>")
if method == "readme":
    swap("size_t num_ops = 50000000;", "size_t num_ops = 5000000;")
    swap("//run_benchmark(100000);", "run_benchmark(100000);")
swap("    return result;\n}", r'''    if (const char* jp = std::getenv("LOB_JSON_OUT")) {
        if (num_ops >= 1000000) {
            std::map<int, size_t> counts;
            for (double v : latencies) counts[v < 1 ? 0 : (int)std::floor(8 * std::log2(v))]++;
            std::ofstream f(jp);
            f << "{\"n\":" << num_ops << ",\"throughput\":" << result.ops_per_sec << ",\"mean\":" << result.mean_ns
              << ",\"p50\":" << result.median_ns << ",\"p99\":" << result.p99_ns << ",\"p999\":" << result.p999_ns
              << ",\"max\":" << latencies.back() << ",\"buckets\":[";
            bool first = true;
            for (auto& kv : counts) {
                f << (first ? "" : ",") << "[" << std::pow(2.0, kv.first / 8.0) << "," << kv.second << "]";
                first = false;
            }
            f << "]}";
        }
    }
    return result;
}''')
open(p, "w").write(s)
PY

cmake -S "$WORK/lob" -B "$WORK/lob/build" -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_COMPILER="$CXX_BIN" >/dev/null
cmake --build "$WORK/lob/build" -j >/dev/null
"$WORK/lob/build/tests" | tail -1

# Cost of the two clock reads that wrap every timed operation.
cat > "$WORK/timer.cpp" <<'CPP'
#include <chrono>
#include <vector>
#include <algorithm>
#include <cstdio>
using Clock = std::chrono::high_resolution_clock;
int main() {
    const size_t n = 2000000;
    std::vector<double> v; v.reserve(n);
    for (size_t i = 0; i < 100000; ++i) { auto a = Clock::now(); auto b = Clock::now(); (void)a; (void)b; }
    for (size_t i = 0; i < n; ++i) {
        auto a = Clock::now(); auto b = Clock::now();
        v.push_back((double)std::chrono::duration_cast<std::chrono::nanoseconds>(b - a).count());
    }
    std::sort(v.begin(), v.end());
    std::printf("%.0f\n", v[n / 2]);
}
CPP
"$CXX_BIN" -O3 -march=native -std=c++17 "$WORK/timer.cpp" -o "$WORK/timer"
TIMER_NS="$("$WORK/timer")"

PIN=()
if [ -n "${PIN_CPU:-}" ] && command -v taskset >/dev/null; then PIN=(taskset -c "$PIN_CPU"); fi

LOAD_BEFORE="$(cut -d" " -f1 /proc/loadavg 2>/dev/null || uptime | sed -E "s/.*load averages?: *([0-9.]+).*/\1/")"
for i in $(seq 1 "$RUNS"); do
  echo "run $i/$RUNS ..."
  LOB_JSON_OUT="$WORK/run$i.json" "${PIN[@]+"${PIN[@]}"}" "$WORK/lob/build/bench" > "$WORK/run$i.txt"
done

CPU="unknown"
if [ -r /proc/cpuinfo ]; then CPU="$(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2- | xargs)"; fi
if command -v sysctl >/dev/null && sysctl -n machdep.cpu.brand_string >/dev/null 2>&1; then CPU="$(sysctl -n machdep.cpu.brand_string)"; fi
OS="$(uname -sr)"
if [ -r /etc/os-release ]; then OS="$(. /etc/os-release && echo "$PRETTY_NAME")"; fi
COMPILER="$("$CXX_BIN" --version | head -1)"
GOV="n/a"
if [ -r /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor ]; then GOV="$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor)"; fi

LOAD_AFTER="$(cut -d" " -f1 /proc/loadavg 2>/dev/null || uptime | sed -E "s/.*load averages?: *([0-9.]+).*/\1/")"

python3 - "$WORK" "$RUNS" "$OUT" "$CPU" "$OS" "$COMPILER" "$GOV" "${PIN_CPU:-}" "$TIMER_NS" "$COMMIT" "$LOAD_BEFORE" "$LOAD_AFTER" "$METHOD" <<'PY'
import json, sys, datetime, statistics
work, runs, out, cpu, os_, compiler, gov, pin, timer, commit, load0, load1, method = sys.argv[1:]
data = [json.load(open(f"{work}/run{i}.json")) for i in range(1, int(runs) + 1)]
keys = ["throughput", "mean", "p50", "p99", "p999", "max"]
med = {k: statistics.median(d[k] for d in data) for k in keys}
rng = {k: [min(d[k] for d in data), max(d[k] for d in data)] for k in keys}
mid = sorted(data, key=lambda d: d["p50"])[len(data) // 2]
result = {
    "date": datetime.date.today().isoformat(),
    "repoCommit": commit,
    "machine": {"cpu": cpu, "os": os_, "compiler": compiler, "governor": gov, "pinnedCpu": pin or None},
    "method": {"name": method, "ops": 5000000 if method == "readme" else 50000000, "warmup": 100000 if method == "readme" else 0, "seed": 42, "flags": "-O3 -march=native", "mix": "60 % add, 25 % cancel, 15 % aggressive"},
    "timerOverheadNs": float(timer),
    "loadAverage1m": {"before": float(load0), "after": float(load1)},
    "runs": [{k: d[k] for k in keys} for d in data],
    "histogram": {"bucketsPerOctave": 8, "buckets": mid["buckets"], "fromRunWithP50": mid["p50"]},
}
json.dump(result, open(out, "w"), indent=1)
print(f"\n{cpu} | {os_} | {compiler} | governor {gov} | pin {pin or 'none'} | timer {timer} ns | load {load0} to {load1} | lob-engine {commit}")
print("| metric | median of runs | min to max |\n|---|---|---|")
labels = {"throughput": "throughput (ops/s)", "mean": "mean (ns)", "p50": "P50 (ns)", "p99": "P99 (ns)", "p999": "P99.9 (ns)", "max": "max (ns)"}
for k in keys:
    print(f"| {labels[k]} | {med[k]:,.0f} | {rng[k][0]:,.0f} to {rng[k][1]:,.0f} |")
print(f"\nwrote {out}")
PY
