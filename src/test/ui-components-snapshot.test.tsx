import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

describe("UI Components Snapshot", () => {
  describe("Button Component", () => {
    it("renders default button", () => {
      const { container } = render(<Button>Click me</Button>);
      expect(container).toMatchSnapshot();
    });

    it("renders primary button variant", () => {
      const { container } = render(
        <Button variant="default" size="lg">
          Primary Action
        </Button>
      );
      expect(container).toMatchSnapshot();
    });

    it("renders secondary button variant", () => {
      const { container } = render(
        <Button variant="secondary" size="md">
          Secondary Action
        </Button>
      );
      expect(container).toMatchSnapshot();
    });

    it("renders destructive button variant", () => {
      const { container } = render(
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      );
      expect(container).toMatchSnapshot();
    });

    it("renders disabled button", () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      expect(container).toMatchSnapshot();
    });

    it("renders loading button", () => {
      const { container } = render(
        <Button disabled>
          Loading...
        </Button>
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe("Input Component", () => {
    it("renders default input", () => {
      const { container } = render(
        <Input placeholder="Enter text..." />
      );
      expect(container).toMatchSnapshot();
    });

    it("renders input with type email", () => {
      const { container } = render(
        <Input type="email" placeholder="your@email.com" />
      );
      expect(container).toMatchSnapshot();
    });

    it("renders input with type password", () => {
      const { container } = render(
        <Input type="password" placeholder="Enter password" />
      );
      expect(container).toMatchSnapshot();
    });

    it("renders disabled input", () => {
      const { container } = render(
        <Input disabled placeholder="Disabled input" />
      );
      expect(container).toMatchSnapshot();
    });

    it("renders input with error state", () => {
      const { container } = render(
        <Input
          aria-invalid="true"
          placeholder="Invalid input"
          className="border-destructive"
        />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe("Badge Component", () => {
    it("renders default badge", () => {
      const { container } = render(<Badge>Default</Badge>);
      expect(container).toMatchSnapshot();
    });

    it("renders secondary badge", () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>);
      expect(container).toMatchSnapshot();
    });

    it("renders destructive badge", () => {
      const { container } = render(<Badge variant="destructive">Error</Badge>);
      expect(container).toMatchSnapshot();
    });

    it("renders outline badge", () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>);
      expect(container).toMatchSnapshot();
    });
  });

  describe("Card Component", () => {
    it("renders card with content", () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      );
      expect(container).toMatchSnapshot();
    });

    it("renders compact card", () => {
      const { container } = render(
        <Card className="p-3">
          <p className="text-sm">Compact card</p>
        </Card>
      );
      expect(container).toMatchSnapshot();
    });

    it("renders interactive card", () => {
      const { container } = render(
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Click me!</p>
          </CardContent>
        </Card>
      );
      expect(container).toMatchSnapshot();
    });

    it("renders card with multiple sections", () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Multi-Section Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>Section 1</div>
            <div>Section 2</div>
            <div>Section 3</div>
          </CardContent>
        </Card>
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe("Component Combinations", () => {
    it("renders form-like structure", () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Login Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="your@email.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full">Login</Button>
          </CardContent>
        </Card>
      );
      expect(container).toMatchSnapshot();
    });

    it("renders listing card with badge", () => {
      const { container } = render(
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Property Title</CardTitle>
              <CardDescription>Location, Type</CardDescription>
            </div>
            <Badge variant="secondary">New</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹15,000</p>
            <p className="text-xs text-muted-foreground">per night</p>
          </CardContent>
        </Card>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
