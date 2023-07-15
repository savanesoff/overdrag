import { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import { Box, Card, Divider, Typography } from "@mui/material";
import Chopper from "./../src";

// @eslint-ignore
declare global {
  interface Window {
    chopper: Chopper;
  }
}
function App() {

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center" }}> This is a demo page for Overdrag</Typography>
    </>
  );
}

export default App;
