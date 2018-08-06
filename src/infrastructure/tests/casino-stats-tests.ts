import { CasinoStats } from "../../modules/casino/casino-stats";


export function test() {
    const stats = new CasinoStats();

    console.log(stats.E);
    console.log(stats.M);
}