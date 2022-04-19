import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import {QuaternaryEntry, theory} from "./api/Theory";
import { Utils } from "./api/Utils";
import {GraphQuality} from "./api/Settings";

var id = "my_custom_theory_id";
var name = "Euler's Formula";
var description = "A basic theory.";
var authors = "! :D";
var version = 1;

var scale;
var currency, currency_R, currency_I;
var q1, q2;
var n, nExp;
var a1, a2, a3, a, aTerm;
var b1, b2, I;
var c1, c2, R;
var q1Exp, q2Exp;
var t;
var q = BigNumber.ONE;
var dimension;
var equationLevel = 0;
var array_R, array_I;
var max_R, max_I;
var value_graph;
var array_rho;
var maxRho;


var state = new Vector3(0, 0, 0);
var center = new Vector3(0, 0, 0);
var swizzles = [(v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.x, v.y, v.z)];

var init = () => {
    scale = 0.2;
    array_R = [];
    array_I = [];
    array_rho = [];
    currency = theory.createCurrency();
    currency_R = theory.createCurrency("R", "R");
    currency_I = theory.createCurrency("I", "I");

    t = BigNumber.ZERO;

    // Regular Upgrades

    // q1
    {
        let getDesc = (level) => "q_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "q_1=" + getQ1(level).toString(0);
        q1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(15, Math.log2(5))));
        q1.getDescription = (_) => Utils.getMath(getDesc(q1.level));
        q1.getInfo = (amount) => Utils.getMathTo(getDesc(q1.level), getDesc(q1.level + amount))
    }

    // q2
    {
        let getDesc = (level) => "q_2=2^{" + level + "}";
        let getInfo = (level) => "q_2=" + getQ2(level).toString(0);
        q2 = theory.createUpgrade(1, currency, new ExponentialCost(5, Math.log2(100) + 2.3));
        q2.getDescription = (_) => Utils.getMath(getDesc(q2.level));
        q2.getInfo = (amount) => Utils.getMathTo(getInfo(q2.level), getInfo(q2.level + amount));
    }


    // n
    {
        let getDesc = (level) => "n=" + getN(level).toString(0);
        let getInfo = (level) => "n=" + getN(level).toString(0);
        n = theory.createUpgrade(2, currency, new ExponentialCost(20, Math.log2(8.5)));
        n.getDescription = (_) => Utils.getMath(getDesc(n.level));
        n.getInfo = (amount) => Utils.getMathTo(getDesc(n.level), getDesc(n.level + amount));
    }

    // b1
    {
        let getDesc = (level) => "b_1=" + getB1(level).toString(0);
        let getInfo = (level) => "b_1=" + getB1(level).toString(0);
        b1 = theory.createUpgrade(3, currency_R, new FirstFreeCost(ExponentialCost(20, Math.log2(5))));
        b1.getDescription = (_) => Utils.getMath(getDesc(b1.level));
        b1.getInfo = (amount) => Utils.getMathTo(getDesc(b1.level), getDesc(b1.level + amount));
        b1.boughtOrRefunded = (_) => checkForScale();
    }

    // b2
    {
        let getDesc = (level) => "b_2=2^{" + level + "}";
        let getInfo = (level) => "b_2=" + getQ2(level).toString(0);
        b2 = theory.createUpgrade(4, currency_R, new ExponentialCost(500, Math.log2(10)));
        b2.getDescription = (_) => Utils.getMath(getDesc(b2.level));
        b2.getInfo = (amount) => Utils.getMathTo(getInfo(b2.level), getInfo(b2.level + amount));
        b2.boughtOrRefunded = (_) => checkForScale();
    }


    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        let getInfo = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(5, currency_I, new FirstFreeCost(new ExponentialCost(20, Math.log2(2))));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
        c1.boughtOrRefunded = (_) => checkForScale();
    }

    // c2
    {
        let getDesc = (level) => "c_2=2^{" + level + "}";
        let getInfo = (level) => "c_2=" + getQ2(level).toString(0);
        c2 = theory.createUpgrade(6, currency_I, new ExponentialCost(500, Math.log2(5)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
        c2.boughtOrRefunded = (_) => checkForScale();
    }

    // a1
    {
        let getDesc = (level) => "a_1=" + getA1(level).toString(0);
        let getInfo = (level) => "a_1=" + getA1(level).toString(0);
        a1 = theory.createUpgrade(7, currency, new FirstFreeCost(new ExponentialCost(2000, 50)));
        a1.getDescription = (_) => Utils.getMath(getDesc(a1.level));
        a1.getInfo = (amount) => Utils.getMathTo(getDesc(a1.level), getDesc(a1.level + amount));
    }

    // a2
    {
        let getDesc = (level) => "a_2=2^{" + level + "}";
        let getInfo = (level) => "a_2=" + getQ2(level).toString(0);
        a2 = theory.createUpgrade(8, currency_R, new ExponentialCost(5000000, 150.5));
        a2.getDescription = (_) => Utils.getMath(getDesc(a2.level));
        a2.getInfo = (amount) => Utils.getMathTo(getInfo(a2.level), getInfo(a2.level + amount));
    }

    // a3
    {
        let getDesc = (level) => "a_3=2^{" + level + "}";
        let getInfo = (level) => "a_3=" + getQ2(level).toString(0);
        a3 = theory.createUpgrade(9, currency_I, new ExponentialCost(5000000, 150.5));
        a3.getDescription = (_) => Utils.getMath(getDesc(a3.level));
        a3.getInfo = (amount) => Utils.getMathTo(getInfo(a3.level), getInfo(a3.level + amount));
    }


    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1);
    theory.createAutoBuyerUpgrade(2, currency, 1);

    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(0.1, 0.1));

    {
        dimension = theory.createMilestoneUpgrade(0, 2);
        dimension.getDescription = () => dimension.level == 0 ? "Unlock the real component R" : "Unlock the imaginary component I";
        dimension.getInfo = () => Localization.getUpgradeAddDimensionDesc();
        dimension.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); theory.invalidateSecondaryEquation(); theory.invalidateTertiaryEquation(); updateAvailability();}
    }

    {
        aTerm = theory.createMilestoneUpgrade(1, 3);
        aTerm.getDescription = (_) => Localization.getUpgradeAddTermDesc(aTerm.level == 0 ? "\\frac{a_1}{100}" : (aTerm.level == 1 ? "\\frac{a_1a_2}{100}" : "\\frac{a_1a_2a_3}{100}"));
        aTerm.getInfo = (_) => Localization.getUpgradeAddTermInfo("\\frac{a_1a_2}{100}");
        aTerm.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }

    {
        nExp = theory.createMilestoneUpgrade(2, 5);
        nExp.description = Localization.getUpgradeIncCustomExpDesc("n", "0.05");
        nExp.info = Localization.getUpgradeIncCustomExpInfo("n", "0.05");
        nExp.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); }
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

    aTerm.isAvailable = dimension.level > 1;
    a1.isAvailable = aTerm.level > 0;
    a2.isAvailable = aTerm.level > 1;
    a3.isAvailable = aTerm.level > 2;

    b1.isAvailable = dimension.level > 0;
    b2.isAvailable = dimension.level > 0;
    c1.isAvailable = dimension.level > 1;
    c2.isAvailable = dimension.level > 1;

    currency_R.isAvailable = dimension.level > 0;
    currency_I.isAvailable = dimension.level > 1;
}



var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    array_rho.push(BigNumber.from(currency.value));
    maxRho = BigNumber.from(Math.max.apply(Math, array_rho));

    let value_q1 = getQ1(q1.level);
    let value_q2 = getQ2(q2.level);
    let dq = dt * value_q1 * value_q2 ** 20;
    q += dq;

    let value_n = getN(n.level).pow(getKExponent(nExp.level));

    let value_b1 = getB1(b1.level);
    let value_b2 = getB2(b2.level);
    let b = BigNumber.from(value_b1 * value_b2);

    let value_c1 = getC1(c1.level);
    let value_c2 = getB2(c2.level);
    let c = BigNumber.from(value_c1 * value_c2);

    let value_a1 = getA1(a1.level);
    let value_a2 = getA2(a2.level);
    let value_a3 = getA3(a3.level);
    a = BigNumber.from(value_a1 * value_a2 * value_a3) / BigNumber.HUNDRED;
    value_graph = BigNumber.from((maxRho / q) / 2);
    R = BigNumber.from(b * value_graph.cos()); // b * cos(q) - real part of solution
    I = BigNumber.from(c * value_graph.sin()); // c * i * sin(q) - "imaginary" part of solution

    state.x = t.toNumber();
    state.y = R.toNumber();
    state.z = I.toNumber();
    if(R != 0) {
        array_R.push(BigNumber.from(R).toString(2));
    }
    if(I != 0) {
        array_I.push(BigNumber.from(I).toString(2));
    }
    max_R = Math.max.apply(Math, array_R);
    max_I = Math.max.apply(Math, array_I);


    if(t > 8) {
        t = 0;
        checkForScale();
        theory.clearGraph();
    }

    let baseCurrencyMultiplier = dt * bonus * (aTerm.level !== 0 ? a : 1);
    currency_R.value += baseCurrencyMultiplier * (Math.abs(R)) ** 2;
    currency_I.value += baseCurrencyMultiplier * (Math.abs(I)) ** 2;
    if(value_q1 == BigNumber.ZERO) {
        currency.value = 0;
    } else {
        t += dt / 10;
        switch (equationLevel) {
            case 0:
                currency.value += baseCurrencyMultiplier * value_n * q;
                break;
            case 1:
                currency.value += baseCurrencyMultiplier * sqrt(value_n * q ** 2 + (currency_R.value ** 2));
                break;
            case 2:
                currency.value += (baseCurrencyMultiplier * sqrt(value_n * q ** 2 + (currency_R.value ** 2) - (currency_I.value ** 2)));
                break;
        }
    }
    theory.invalidateTertiaryEquation();
}

var postPublish = () => {
    scale = 0.2;
    array_rho = [];
    t = BigNumber.ZERO;
    q = BigNumber.ONE;
}

var checkForScale = () => {
    if(max_R > (8 / scale) / 4 || max_I > (8 / scale) / 4) { // scale down everytime R or I gets larger than the screen
        theory.clearGraph();
        let old_scale = scale; // save previous scale
        scale = (50 / 100) * old_scale // scale down by 50%
    }
}

// EQUATIONS
// -------------------------------------------------------------------------------
var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 60;
    let result = "\\begin{array}{c}\\dot{\\rho} = ";
    let nStr = "n";
    if(nExp.level != 0) {
        nStr += "^{" + getKExponent(nExp.level).toString(2) + "}";
    }
    switch (aTerm.level) {
        case 0:
            result += ""
            break;
        case 1:
            result += "\\frac{a_1}{100}";
            break;
        case 2:
            result += "\\frac{a_1a_2}{100}";
            break;
        case 3:
            result += "\\frac{a_1a_2a_3}{100}";
            break;
    }
    switch(dimension.level) {
        case 0:
            result += nStr + "q\\\\";
            result += "e^{iq} = \\cos(q) + i\\sin(q)";
            break;
        case 1:
            result += "\\sqrt{" + nStr + "q^2 + R^2}\\\\";
            result += "e^{iq} = b\\cos(q) + i\\sin(q)";
            break;
        case 2:
            result += "\\sqrt{" + nStr + "q^2 + R^2 - I^2}\\\\";
            result += "e^{iq} = b\\cos(q) + ci\\sin(q)";
            break;
    }

    result += "\\end{array}";
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 70;
    let result = "\\begin{array}{c}";
    switch(dimension.level) {
        case 0:
            result += "\\dot{q} = q_1q_2\\\\";
            break;
        case 1:
            result += "\\dot{q} = q_1q_2,\\quad\\dot{R} = b_1b_2\\cos(q)\\\\";
            break;
        case 2:
            result += "\\dot{q} = q_1q_2,\\quad\\dot{R} = b_1b_2\\cos(q),\\quad\\dot{I} = -(ic_1c_2\\sin(q))^2\\\\";
            break;
    }
    result += theory.latexSymbol + "=\\max\\rho^{0.1}";
    result += "\\end{array}"
    return result;
}

var getTertiaryEquation = () => {
    let high = Math.max.apply(Math, array_R);
    let high2 = Math.max.apply(Math, array_I);
    let result = "\\text{q: " + q.toString() + " | " + (maxRho / q) / 2 + " | scale: " + scale + " | tau^{\\frac{1}{0.1}}: " + maxRho + " | maxRI: " + high + "/" + high2 + "}";

    /*result += "\\begin{matrix}q=";
    result += q.toString();
    result += ",\\;R =";
    result += BigNumber.from(R).toString(2);
    result += ",\\;I =";
    result += BigNumber.from(I).toString(2);
    result += "\\end{matrix}";*/

    return result;
}
// -------------------------------------------------------------------------------

var sqrt = (n) => (BigNumber.from(n)).sqrt();
var get3DGraphPoint = () => swizzles[0]((state - center) * scale);
var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var isCurrencyVisible = (index) => index == 0 || (index == 1 && dimension.level > 0) || (index == 2 && dimension.level > 1);
var getTau = () => currency.value.pow(BigNumber.from(0.1));

var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getQ2 = (level) => BigNumber.TWO.pow(level);
var getN = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getA1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getA2 = (level) => BigNumber.TWO.pow(level);
var getA3 = (level) => BigNumber.TWO.pow(level);
var getB1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getB2 = (level) => BigNumber.TWO.pow(level);
var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getKExponent = (level) => BigNumber.from(1 + 0.05 * level);

init();