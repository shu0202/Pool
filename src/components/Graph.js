import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const MyGraphComponent = ({ poolId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const investmentData = await fetchInvestmentData(poolId);
      // Assuming you transform `investmentData` to your chart library's expected format
      setData({
        labels: investmentData.map((item) => item.date),
        datasets: [{ data: investmentData.map((item) => item.amount) }],
      });
    };

    loadData();
  }, [poolId]);

  if (!data) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <LineChart
      data={data}
      width={Dimensions.get("window").width} // from react-native
      height={220}
      yAxisLabel="$"
      yAxisSuffix="k"
      chartConfig={{
        backgroundColor: "#e26a00",
        backgroundGradientFrom: "#fb8c00",
        backgroundGradientTo: "#ffa726",
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );
};
