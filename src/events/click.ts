export const onJoinGroup = (playerName: string) => {
  playerName &&
    window.open(
      `/game/${playerName}`,
      "_blank",
      "width=800,height=600,left=100,top=100,resizable=yes,toolbar=no"
    );
};
