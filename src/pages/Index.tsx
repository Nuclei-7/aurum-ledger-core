
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Aurum.Gold Blockchain Explorer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Latest Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View the most recent blocks in the blockchain</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View transaction statistics and metrics</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Network Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Check the current status of the blockchain network</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
