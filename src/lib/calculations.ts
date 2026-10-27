
export type ApplianceInput = {
  wattage: number;
  quantity: number;
  hoursPerDay: number;
};

export function calculateApplianceUsage(appliance: ApplianceInput) {
  const dailyKwh =
    (appliance.wattage *
      appliance.quantity *
      appliance.hoursPerDay) /
    1000;

  return {
    dailyKwh,
    monthlyKwh: dailyKwh * 30,
  };
}

export function calculateElectricityCost(
  monthlyKwh: number,
  tariffPerKwh: number,
) {
  return monthlyKwh * tariffPerKwh;
}

export function calculateTotalUsage(appliances: ApplianceInput[]) {
  return appliances.reduce(
    (total, appliance) => {
      const usage = calculateApplianceUsage(appliance);

      return {
        dailyKwh: total.dailyKwh + usage.dailyKwh,
        monthlyKwh: total.monthlyKwh + usage.monthlyKwh,
      };
    },
    { dailyKwh: 0, monthlyKwh: 0 },
  );
}
