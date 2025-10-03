# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8] [cursor=pointer]
  - alert [ref=e11]
  - generic [ref=e13]:
    - generic [ref=e14]:
      - heading "Sign in to your account" [level=2] [ref=e15]
      - paragraph [ref=e16]: Access the Stamford Parking System
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]:
            - text: Email address
            - generic "required" [ref=e22]: "*"
          - textbox "Email addressrequired" [ref=e23]
        - generic [ref=e24]:
          - generic [ref=e25]:
            - text: Password
            - generic "required" [ref=e26]: "*"
          - textbox "Passwordrequired" [ref=e27]
        - button "Sign in" [ref=e28]:
          - generic [ref=e29]: Sign in
      - paragraph [ref=e31]:
        - text: Don't have an account?
        - link "Sign up here" [ref=e32] [cursor=pointer]:
          - /url: /auth/signup
    - link "← Back to home" [ref=e34] [cursor=pointer]:
      - /url: /
```