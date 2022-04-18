import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import {QuaternaryEntry, theory} from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "my_custom_theory_id";
var name = "My Custom Theory";
var description = "A basic theory.";
var authors = "Gilles-Philippe Paillé";
var version = 1;

var scale=0.2;
var currency;
var q1, q2;
var b1, b2, b;
var c1, c2, c;
var t;
var q = BigNumber.ONE;
var q1Exp, q2Exp;
var b1Exp, b2Exp;
var c1Exp, c2Exp;

var achievement1, achievement2;
var chapter1, chapter2;

var state = new Vector3(0, 0, 0);
var center = new Vector3(0, 0   , 0);
var swizzles = [(v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.x, v.y, v.z)];

var init = () => {
    currency = theory.createCurrency();

    t = BigNumber.ZERO;

    // Regular Upgrades

    // q1
    {
        let getDesc = (level) => "q_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "q_1=" + getQ1(level).toString(0);
        q1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(15, Math.log2(2))));
        q1.getDescription = (_) => Utils.getMath(getDesc(q1.level));
        q1.getInfo = (amount) => Utils.getMathTo(getDesc(q1.level), getDesc(q1.level + amount));
    }

    // q2
    {
        let getDesc = (level) => "q_2=2^{" + level + "}";
        let getInfo = (level) => "q_2=" + getQ2(level).toString(0);
        q2 = theory.createUpgrade(1, currency, new ExponentialCost(5, Math.log2(10)));
        q2.getDescription = (_) => Utils.getMath(getDesc(q2.level));
        q2.getInfo = (amount) => Utils.getMathTo(getInfo(q2.level), getInfo(q2.level + amount));
    }

    // b1
    {
        let getDesc = (level) => "b_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "b_1=" + getQ1(level).toString(0);
        b1 = theory.createUpgrade(2, currency, new ExponentialCost(20, 3));
        b1.level = 1;
        b1.getDescription = (_) => Utils.getMath(getDesc(b1.level));
        b1.getInfo = (amount) => Utils.getMathTo(getDesc(b1.level), getDesc(b1.level + amount));
    }

    // b2
    {
        let getDesc = (level) => "b_2=2^{" + level + "}";
        let getInfo = (level) => "b_2=" + getQ2(level).toString(0);
        b2 = theory.createUpgrade(3, currency, new ExponentialCost(50, Math.log2(10)));
        b2.getDescription = (_) => Utils.getMath(getDesc(b2.level));
        b2.getInfo = (amount) => Utils.getMathTo(getInfo(b2.level), getInfo(b2.level + amount));
    }

    // c1
    {
        let getDesc = (level) => "c_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "c_1=" + getQ1(level).toString(0);
        c1 = theory.createUpgrade(4, currency, new ExponentialCost(20, 3));
        c1.level = 1;
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=2^{" + level + "}";
        let getInfo = (level) => "c_2=" + getQ2(level).toString(0);
        c2 = theory.createUpgrade(5, currency, new ExponentialCost(50, Math.log2(10)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }


    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);


    // TODO

    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));

   {
        q1Exp = theory.createMilestoneUpgrade(0, 3);
        q1Exp.description = Localization.getUpgradeIncCustomExpDesc("c_1", "0.05");
        q1Exp.info = Localization.getUpgradeIncCustomExpInfo("c_1", "0.05");
        q1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        q2Exp = theory.createMilestoneUpgrade(1, 3);
        q2Exp.description = Localization.getUpgradeIncCustomExpDesc("c_2", "0.05");
        q2Exp.info = Localization.getUpgradeIncCustomExpInfo("c_2", "0.05");
        q2Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    /*

    TODO

    //// Achievements
    achievement1 = theory.createAchievement(0, "Achievement 1", "Description 1", () => q1.level > 1);
    achievement2 = theory.createSecretAchievement(1, "Achievement 2", "Description 2", "Maybe you should buy two levels of q2?", () => q2.level > 1);

    TODO

    //// Story chapters

    */

    updateAvailability();
}

var updateAvailability = () => {
    q2Exp.isAvailable = q1Exp.level > 0;
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    let value_q1 = getQ1(q1.level).pow(getC1Exponent(q1Exp.level));
    let value_q2 = getQ2(q2.level).pow(getC2Exponent(q2Exp.level));

    let dq = dt * value_q1 * value_q2;
    q += dq;

    let value_b1 = getQ1(b1.level);
    let value_b2 = getQ2(b2.level);
    b = BigNumber.from(value_b1 * value_b2);

    let value_c1 = getQ1(b1.level);
    let value_c2 = getQ2(b2.level);
    c = BigNumber.from(value_c1 * value_c2);

    currency.value += dt * bonus *q;

    t += dt;
    if(t>BigNumber.from("1e9")){

        theory.clearGraph();
        t = BigNumber.ZERO;
    }

    let value_graph = BigNumber.from(currency.value / q);
    let graph_y = (c * value_graph).sin().toNumber(); // cisin(q)
    let graph_z = (b * value_graph).cos().toNumber(); // bcos(q)

    state.x = t.toNumber();
    state.y = graph_y;
    state.z = graph_z;

    theory.invalidateTertiaryEquation();
}

// EQUATIONS
// -------------------------------------------------------------------------------
var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 50;
    let result = "\\dot{\\rho} = \\sqrt{q^2 + R^2 - I^2}\\\\";
    result += "e^{iq} = b\\cos(q) + ci\\sin(q)";
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 60;
    let result = "";
    result += "\\dot{q} = q_1q_2\\quad\\dot{b} = b_1b_2\\quad\\dot{c} = c_1c_2\\\\";
    result += "\\qquad\\quad\\quad\\enspace\\!" + theory.latexSymbol + "=\\max\\rho^{0.1}";
    return result;
}

var getTertiaryEquation = () => {
    let result = "";

    result += "\\begin{matrix}q=";
    result += q.toString();
    result += ",&R =";
    result += "0.00";
    result += ",&I =";
    result += "0.00";
    result += "\\end{matrix}";

    return result;
}
// -------------------------------------------------------------------------------

var sqrt = (n) => (BigNumber.from(n)).sqrt();
var get3DGraphPoint = () => swizzles[0]((state - center) * scale);
var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value.pow(BigNumber.from(0.1));;

var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getQ2 = (level) => BigNumber.TWO.pow(level);
var getC1Exponent = (level) => BigNumber.from(1 + 0.05 * level);
var getC2Exponent = (level) => BigNumber.from(1 + 0.05 * level);

init();