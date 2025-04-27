import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Upload from "@/pages/Upload";
import { queryClient } from "./lib/queryClient";

// Placeholder component for Sakums
const Sakums = () => <div>Sakums Page</div>;


function Router() {
  return (
    <Switch>
      <Route path="/gallery" component={Home}/>
      <Route path="/upload" component={Upload}/>
      <Route path="/" component={Sakums}/> {/* Added Sakums route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;